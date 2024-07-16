import {
    InlineLayout,
    Link,
    Text,
    useBuyerJourneySteps,
    useBuyerJourneyActiveStep, Icon,
} from '@shopify/ui-extensions-react/checkout';

const BreadcrumbItem = ({to, index, activeStepIndex, activeStep, handle, label}) => {
    const textColor = (index >= activeStepIndex && activeStep?.handle !== handle) ? 'subdued' : undefined;
    const emphasis = activeStep?.handle === handle ? 'bold' : undefined

    return (
        <Text
            size="large"
            emphasis={emphasis}
            appearance={textColor}>

            {index + 1}.&nbsp;
            {label}
        </Text>
    )
}

export default function () {
    const steps = useBuyerJourneySteps();
    const activeStep = useBuyerJourneyActiveStep();

    const assembledSteps = steps.map(step => {
        let label = step.label

        switch (step.handle) {
            case "information":
                label = "Details"
                break;
            case "shipping":
                label = "Shipping & Taxes"
                break;
        }

        return {
            ...step,
            label
        }
    })

    const activeStepIndex = assembledSteps.findIndex(
        ({handle}) => handle === activeStep?.handle,
    );

    return (
        <InlineLayout
            accessibilityRole="orderedList"
            spacing="loose"
            inlineAlignment="start"

            padding="none"
            columns="auto"
        >
            {assembledSteps.map(({label, handle, to}, index) => {
                const props = {
                    label,
                    handle,
                    to,
                    activeStep,
                    activeStepIndex,
                    index
                }

                return <InlineLayout
                    accessibilityRole="listItem"
                    inlineAlignment="center"
                    blockAlignment="center"
                    key={handle}
                    spacing="base"
                    columns="auto"
                >
                    {index < activeStepIndex ?
                        <Link to={to}><BreadcrumbItem {...props} /></Link> : <BreadcrumbItem {...props} />
                    }

                    {index < assembledSteps.length - 1 ? (
                        <Icon source="chevronRight"/>
                    ) : null}
                </InlineLayout>
            })}
        </InlineLayout>
    );
}
