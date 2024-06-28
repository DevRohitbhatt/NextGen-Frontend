import React from "react";
import { Steps, Hints } from "intro.js-react";
import "intro.js/introjs.css";

export default function IntroJS({ introJS, setIntroJS }) {
    //Destructure introJS into steps, enabled, so on

    const handleIntroStart = () => {
        setIntroJS({ ...introJS, stepsEnabled: true });
      };

    return (
        <Steps
            enabled={introJS.enabled}
            steps={introJS.steps}
            initialStep={introJS.initialStep}
            onExit={() => {
                setIntroJS({ ...introJS, enabled: false });
            }}
        />
    )
}