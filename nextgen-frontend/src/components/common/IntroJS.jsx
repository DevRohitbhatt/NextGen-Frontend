import React, { useEffect, useState } from "react";
import { Steps, Hints } from "intro.js-react";
import "intro.js/introjs.css";

export default function IntroJS({ introJS, setIntroJS }) {

    const handleIntroStart = () => {
        setIntroJS({ ...introJS, stepsEnabled: true });
      };

    return (
        <Steps
            enabled={introJS.stepsEnabled}
            steps={introJS.steps}
            initialStep={introJS.initialStep}
            onExit={() => {
                setIntroJS(prevState => ({ ...prevState, stepsEnabled: false }));
            }}
        />
    )
}