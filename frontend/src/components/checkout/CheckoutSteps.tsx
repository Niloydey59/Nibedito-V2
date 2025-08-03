export default function CheckoutSteps({ currentStep, steps }) {
    return (
        <div className={styles.stepsContainer}>
            {steps.map((step, index) => (
                <div 
                    key={step.title}
                    className={`${styles.step} ${
                        index + 1 === currentStep ? styles.active :
                        index + 1 < currentStep ? styles.completed : ''
                    }`}
                >
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <div className={styles.stepTitle}>{step.title}</div>
                </div>
            ))}
        </div>
    );
}
