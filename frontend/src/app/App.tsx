import AppRouter from "./AppRouter";
import { StorefrontProvider } from "./StorefrontProvider";
import ScrollToTop from "../components/common/ScrollToTop";

export default function App() {
    return (
        <StorefrontProvider>
            <ScrollToTop />
            <AppRouter />
        </StorefrontProvider>
    );
}
