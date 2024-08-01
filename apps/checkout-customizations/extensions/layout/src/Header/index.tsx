import {
    BlockLayout, InlineLayout,
    reactExtension, Image, View, Grid, GridItem
} from "@shopify/ui-extensions-react/checkout";

import Breadcrumbs from './Breadcrumbs'
import Logo from "./Logo";

export default reactExtension("purchase.checkout.header.render-after", () => (
    <Header></Header>
));


const Header = () => (
    <Grid
        rows="auto"
        spacing="base"
    >
        <Logo/>
        <Breadcrumbs/>
    </Grid>
)
