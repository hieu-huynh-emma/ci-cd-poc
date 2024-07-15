import {
    BlockLayout,
    reactExtension, View,
} from "@shopify/ui-extensions-react/checkout";

import Breadcrumbs from './Breadcrumbs'
import Logo from "./Logo";

export default reactExtension("purchase.checkout.header.render-after", () => (
    <Header></Header>
));


const Header = () => (
    <BlockLayout rows="auto" spacing="base">
        <Logo />
        <Breadcrumbs />
    </BlockLayout>
)
