import React, { useEffect, useRef, useState } from "react";

const HhmmssSelector = (props) => {
  const { enableSeconds = true } = props;
  const [hh, setHh] = useState("00");
  const [mm, setMm] = useState("00");
  const [ss, setSs] = useState("00");

  const hhRef = useRef(null);
  const mmRef = useRef(null);
  const ssRef = useRef(null);

  const calculateTotalSeconds = () => {
    const hours = parseInt(hh) || 0;
    const minutes = parseInt(mm) || 0;
    const seconds = enableSeconds ? parseInt(ss) || 0 : 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    props.onTimeChange(totalSeconds);
  };

  const hour = (e, name) => {
    const value = e.target.value;
    setHh(value);
    if (parseInt(value) < 24) {
      if (value.length === 2) {
        mmRef.current.focus();
      }
    }
  };

  const minute = (e, name) => {
    const value = e.target.value;
    if (parseInt(value) < 60) {
      setMm(value);
      if (value.length === 2 && enableSeconds) {
        ssRef.current.focus();
      }
    }
  };

  const sec = (e, name) => {
    const value = e.target.value;
    if (parseInt(value) < 60) {
      setSs(e.target.value);
    }
  };
  const handleFieldInteraction = (action, field) => {
    const fieldRefs = {
      hh: hhRef.current,
      mm: mmRef.current,
      ss: ssRef.current,
    };

    const fieldValues = {
      hh: hh,
      mm: mm,
      ss: ss,
    };

    if (action === "focus") {
      // Focus the selected field
      fieldRefs[field]?.select();
    }

    if (action === "keydown" && fieldRefs[field]?.length === 1) {
      // Add padding if the field value is a single digit
      const paddedValue = "0" + fieldRefs[field];
      if (field === "hh") setHh(paddedValue);
      else if (field === "mm") setMm(paddedValue);
      else if (field === "ss") setSs(paddedValue);
    }

    if (action === "blur") {
      // Add padding on blur if the field value is a single digit
      setTimeout(() => {
        if (fieldRefs[field]?.length === 1) {
          const paddedValue = "0" + fieldRefs[field];
          if (field === "hh") setHh(paddedValue);
          else if (field === "mm") setMm(paddedValue);
          else if (field === "ss") setSs(paddedValue);
        }
      }, 100);
    }
  };
  // const changeFocusToNext = (name) => {
  //   if (name === "hh") {
  //     hhRef.current.select();
  //   } else if (name === "mm") {
  //     mmRef.current.select();
  //   } else if (name === "ss") {
  //     ssRef.current.select();
  //   }
  // };
  // const onKeyDownCapture = (e, name) => {
  //   if (e.code == "Tab" && name === "hh" && hh.length == 1) {
  //     setHh("0" + hh);
  //   } else if (e.code == "Tab" && name === "mm" && mm.length == 1) {
  //     setMm("0" + mm);
  //   } else if (e.code == "Tab" && name === "ss" && ss.length == 1) {
  //     setSs("0" + ss);
  //   }
  // };

  // const onBlureHandle = (name) => {
  //   setTimeout(() => {
  //     if (name === "hh" && hhRef.current.value.length == 1) {
  //       setHh("0" + hh);
  //     } else if (name === "mm" && mmRef.current.value.length == 1) {
  //       setMm("0" + mm);
  //     } else if (name === "ss" && ssRef.current.value.length == 1) {
  //       setSs("0" + ss);
  //     }
  //   }, 100);
  // };

  useEffect(() => {
    if (props.initialSeconds) {
      const hours = String(Math.floor(props.initialSeconds / 3600)).padStart(
        2,
        "0"
      );
      const minutes = String(
        Math.floor((props.initialSeconds % 3600) / 60)
      ).padStart(2, "0");
      const seconds = String(props.initialSeconds % 60).padStart(2, "0");

      setHh(hours);
      setMm(minutes);
      if (enableSeconds) {
        setSs(seconds);
      }
    }
  }, [props?.initDataLoading]);

  useEffect(() => {
    calculateTotalSeconds();
  }, [hh, mm, ss]);
  return (
    <div
      className={`bg-gray-200 py-2 w-full rounded-full box-content flex ${
        props.showErrorFeild ? "border border-red-500" : "border-none"
      }`}
    >
      {props.initDataLoading ? (
        <div className="w-[95px]">Loading...</div>
      ) : (
        <>
          <input
            type="text"
            value={hh}
            className="bg-gray-200 text-right  w-[20px] focus:outline-none ml-2"
            onChange={(e) => {
              hour(e);
            }}
            ref={hhRef}
            onFocus={() => {
              handleFieldInteraction("focus", "hh");
            }}
            onKeyDown={(e) =>
              e.code === "Tab" && handleFieldInteraction("keydown", "hh")
            }
            onBlur={() => handleFieldInteraction("blur", "hh")}
          />
          <p className="mx-[3px]">:</p>
          <input
            type="text"
            value={mm}
            className={`bg-gray-200 w-[20px] focus:outline-none ${
              !enableSeconds && "mr-2"
            }`}
            onChange={(e) => {
              minute(e);
            }}
            maxLength={2}
            ref={mmRef}
            onFocus={() => handleFieldInteraction("focus", "mm")}
            onKeyDown={(e) =>
              e.code === "Tab" && handleFieldInteraction("keydown", "mm")
            }
            onBlur={() => handleFieldInteraction("blur", "mm")}
          />
          {enableSeconds && <p className="mx-[3px]">:</p>}
          {enableSeconds && (
            <input
              type="text"
              maxLength={2}
              value={ss}
              className="bg-gray-200 w-[20px] focus:outline-none mr-2"
              onChange={(e) => {
                sec(e);
              }}
              ref={ssRef}
              onFocus={() => handleFieldInteraction("focus", "ss")}
              onKeyDown={(e) => e.code === "Tab" && handleFieldInteraction("keydown", "ss")}
              onBlur={() => handleFieldInteraction("blur", "ss")}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HhmmssSelector;
