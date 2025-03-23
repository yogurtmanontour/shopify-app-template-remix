import { BlockStack, Card, IndexTable, Layout, Page, Text } from "@shopify/polaris"

const OrderTable = (()=>(
    // <IndexTable>

    // </IndexTable>
    <Text as="p">Placeholder</Text>
))

export default function ViewOrders() {
    return (
        <Page
            fullWidth
            title="Orders"
            backAction={{content: 'Home', url: `/app`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg" >Unfulfilled Orders</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}