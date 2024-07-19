import {
    Banner,
    reactExtension, useStorage, Text, BlockLayout,
} from '@shopify/ui-extensions-react/checkout';

import {useEffect, useState} from "react";
import {Storage} from "@shopify/ui-extensions/build/ts/surfaces/checkout/api/standard/standard";

export default reactExtension(
    "purchase.checkout.header.render-after",
    () => <CheckoutCountdown/>,
);

// 20 minutes
const TIME_LIMIT = 1000 * 60 * 20;
const INTERVAL_TIME = 1000

function CheckoutCountdown() {
    const storage = useStorage();
    const [timeLeft, setTimeLeft] = useState<number>(0)

    useEffect(async () => {
        const remainingTime = await getTimeLeft(storage)

        setTimeLeft(remainingTime)
    }, []);


    useEffect(() => {
        if (!timeLeft) return

        const intervalId = setInterval(async () => {
            const remainingTime: number = timeLeft - 1000

            setTimeLeft(remainingTime)
        }, INTERVAL_TIME)
        return () => {
            storage.delete("checkoutRemainingTime")
            clearInterval(intervalId)
        };
    }, [timeLeft]);


    return timeLeft ? (
        <Banner status="warning">
            <BlockLayout inlineAlignment="center" rows={["auto"]}>
                <Text>
                    An item in your cart is in high demand.
                </Text>
                <Text>
                    Your order is reserved for {epochToMinutes(timeLeft)}. Check out soon!</Text>
            </BlockLayout>

        </Banner>
    ) : null
}

async function getTimeLeft(storage: Storage) {
    const persistedRemainingTime: number = await storage.read("checkoutRemainingTime")

    let time = +persistedRemainingTime

    if (!persistedRemainingTime) {
        time = generateDeadline()
        await storage.write("checkoutRemainingTime", time)
    }
    return time
}

function generateDeadline() {
    const currentTime = new Date().getTime();
    const endTime = currentTime + TIME_LIMIT;

    return endTime - currentTime
}

function epochToMinutes(epoch: number) {
    const minutes = Math.floor(epoch / 1000 / 60);
    const seconds = Math.floor((epoch / 1000) % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");


    return minutes ? `${formattedMinutes}:${formattedSeconds} minutes` : `${formattedSeconds} seconds`
}
