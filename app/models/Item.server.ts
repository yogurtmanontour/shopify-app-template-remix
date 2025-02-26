import db from "../db.server";


export interface ItemType {
    ID : string 
    Shop : string
    ProductID : string
    ProductVariantID : string 
    ProductHandle : string
    SerialNumber : string
    productDeleted: string
    productTitle: string
    productImage: string
    productAlt: string
}

export async function GetItem (ID: string, graphql: any): Promise<ItemType | null> {
    const Item = await db.item.findFirst({ where: { ID } });
  
    if (!Item) {
        return null;
    }
    return SupplementItem(Item,graphql);
}

export async function GetManyItems(Shop: string, graphql: any): Promise<Array<ItemType>> {
    const Items = await db.item.findMany({ where: { Shop }, orderBy: {ID : "desc"} });
  
    if (Items.length === 0) return [];
    return Promise.all(
        Items.map((Item) => SupplementItem(Item, graphql))
    );
}
  
async function SupplementItem(Item: any, graphql: any) {
    const response = await graphql(
        `
          query SupplementItem($id: ID!) {
            product(id: $id) {
              title
              images(first: 1) {
                nodes {
                  altText
                  url
                }
              }
            }
          }
        `,
        {
          variables: {
            id: Item.ProductID,
          },
        }
      );

    const {
        data: { product },
    } = await response.json();

    return {
        ...Item,
        productDeleted: !product?.title,
        productTitle: product?.title,
        productImage: product?.images?.nodes[0]?.url,
        productAlt: product?.images?.nodes[0]?.altText,
    }
}

export function validateItem(data: any){
    const errors: any = {};

    if (!data.ProductID) {
        errors.ProductID = "Product is required";
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}