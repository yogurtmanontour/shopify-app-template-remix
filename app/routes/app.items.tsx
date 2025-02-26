import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  EmptyState,
  IndexTable,
  Badge,
  Thumbnail,
  Button,
} from "@shopify/polaris";
import { GetManyItems, ItemType } from "app/models/Item.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { ImageIcon } from "@shopify/polaris-icons";
import {Redirect} from '@shopify/app-bridge/actions';
import { useAppBridge } from "@shopify/app-bridge-react";

export async function loader({ request } : LoaderFunctionArgs) {
    const { admin, session } = await authenticate.admin(request);
    const Items : ItemType[] = await GetManyItems(session.shop, admin.graphql);
  
    return Response.json({
        Items
    });
  }

function Truncate(str : String, { length = 25 } = {}) {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.slice(0, length) + "…";
}

const EmptyItemsState = (
    <EmptyState
        heading="Create some items to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        action={{content:"Create Items", url:"/app/items/new"}}
    >
        <p>Track all stock using UIDs</p>
    </EmptyState>
)

const ItemsTableRow = ({Item}:{Item:ItemType}) => (
    <IndexTable.Row id={Item.ID} position={Number(Item.ID)}>
        <IndexTable.Cell>
            <Link url={"/app/items/"+Item.ID}>
                <Text as={"p"} fontWeight="bold">{Item.ID}</Text>
            </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Thumbnail
                source={Item.productImage || ImageIcon}
                alt={Item.productTitle}
                size="small"
            />
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Link url={"https://admin.shopify.com/store/"+Item.Shop.slice(0,-14)+"/products/"+Item.ProductID.slice(-13)}>
                <Text as={"p"}>{Truncate(Item.ProductHandle)}</Text>
            </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as={"p"}>{Item.SerialNumber}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as={"p"}>N/A</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Badge tone="critical">Unknown</Badge>
        </IndexTable.Cell>
    </IndexTable.Row>
)

const ItemsTable = ({Items}: {Items:ItemType[]}) => (
    <IndexTable emptyState={EmptyItemsState} itemCount={Items.length} headings={[
        {title:"UID"},
        {title: "Thumbnail", hidden: true },
        {title:"Product"},
        {title:"Serial Number"},
        {title:"Cost"},
        {title:"status"}
    ]}> 
        {Items.map((Item:any) => (
            <ItemsTableRow Item={Item}/>
        ))}
    </IndexTable>
)

export default function ItemsPage() {
    const {Items} : {Items: ItemType[]} = useLoaderData();
    
    return (
        <Page
            fullWidth
            title = "Items"
            primaryAction={<Button variant="primary">Create Item</Button>}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <ItemsTable Items={Items}/>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
