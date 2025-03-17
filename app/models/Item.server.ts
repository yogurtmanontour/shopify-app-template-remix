import { GraphQLClient } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/types";
import db from "../db.server";
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

const LocationID = "99206562125"

export interface ItemType {
    ID : number 
    PurchaseItemID: number
    ProductID : string
    ProductVariantID : string 
    ProductHandle : string
    SerialNumber : string
    ProductTitle: string
    ProductImage: string
    ProductAlt: string
}

export interface CreateItemType {
    ID : number 
    PurchaseItemID: number
    ProductID : string
    ProductVariantID : string 
    ProductHandle : string
    ProductTitle: string
    ProductImage: string
    ProductAlt: string
    SerialNumber : string
}

export interface CreateItemErrors {
    ID : string,
    ProductID : string
}

export async function GetItem (ID: number): Promise<ItemType | null> {
    const Item = await db.item.findFirst({ where: { ID } });
  
    if (!Item) {
        return null;
    }
    return Item
}

export async function GetManyItems(): Promise<Array<ItemType>> {
    const Items = await db.item.findMany({ orderBy: {ID : "desc"} });
  
    if (Items.length === 0) return [];
    return Items
}

export async function AddItem(Item: CreateItemType, Admin : AdminApiContextWithoutRest) : Promise<ItemType | null> {
    let DBItem = await db.item.create({data: Item})
    if (DBItem!=null) {
        return await AlterStockByVarientID(DBItem.ProductVariantID, 1, DBItem.PurchaseItemID, Admin) ? DBItem : null
    }
    return null
}

export async function DeleteItem(ItemID: number, Admin : AdminApiContextWithoutRest) : Promise<boolean> {
    let DBItem = await db.item.delete({ where: { ID: ItemID } });
    if (DBItem!=null) {
        return AlterStockByVarientID(DBItem.ProductVariantID, -1, DBItem.PurchaseItemID, Admin)
    }
    return false
}

async function AlterStockByVarientID(ProductVarientID : string, Delta: number, PurchaseItemID : number, Admin : AdminApiContextWithoutRest) : Promise<boolean> {
    const InventoryIDResponse = await Admin.graphql(
        `
            query ProductVariantMetafield($VarientID: ID!) {
                productVariant(id: $VarientID) {
                    inventoryItem {
                        id
                    }
                }
            }
        `,
        {
            variables: {
                VarientID: ProductVarientID,
              },
        }
    );

    const {
        data: { productVariant },
    } = await InventoryIDResponse.json();

    const UpdateInventoryResponse = await Admin.graphql(
        `
            mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
                inventoryAdjustQuantities(input: $input) {
                    userErrors {
                        field
                        message
                    }
                    inventoryAdjustmentGroup {
                    createdAt
                    reason
                    referenceDocumentUri
                    changes {
                        name
                        delta
                    }
                    }
                }
            }
        `,
        {
            variables: {
                input: {
                  reason: "received",
                  name: "available",
                  referenceDocumentUri: `https://admin.shopify.com/store/stagewarehousetest/apps/serialapp-1/app/purchaseitems/${PurchaseItemID}`,
                  changes: [
                    {
                      delta: Delta,
                      inventoryItemId: productVariant.inventoryItem.id,
                      locationId: `gid://shopify/Location/${LocationID}`
                    }
                  ]
                }
              }
        }
    );

    const {
        data: { inventoryAdjustQuantities },
    } = await UpdateInventoryResponse.json();

    return !(inventoryAdjustQuantities.userErrors.length > 0)
}

export function validateItem(data: CreateItemType) : CreateItemErrors | null{
    let HasError = false
    const errors : CreateItemErrors = {
        ID: "",
        ProductID: ""
    };

    if (!data.ID) {
        errors.ID = "An ID is required";
        HasError = true
    }

    if (!data.ProductID) {
        errors.ProductID = "A product is required";
        HasError = true
    }

    if (HasError) {
        return errors;
    }
    return null
}