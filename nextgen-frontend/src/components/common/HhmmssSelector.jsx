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

  const activeFocuse = (name) => {
    if (name === "hh") {
      hhRef.current.select();
    } else if (name === "mm") {
      mmRef.current.select();
    } else if (name === "ss") {
      ssRef.current.select();
    }
  };
  const onKeyDownCapture = (e, name) => {
    if (e.code == "Tab" && name === "hh" && hh.length == 1) {
      setHh("0" + hh);
    } else if (e.code == "Tab" && name === "mm" && mm.length == 1) {
      setMm("0" + mm);
    } else if (e.code == "Tab" && name === "ss" && ss.length == 1) {
      setSs("0" + ss);
    }
  };

  const onBlureHandle = (name) => {
    setTimeout(() => {
      if (name === "hh" && hhRef.current.value.length == 1) {
        setHh("0" + hh);
      } else if (name === "mm" && mmRef.current.value.length == 1) {
        setMm("0" + mm);
      } else if (name === "ss" && ssRef.current.value.length == 1) {
        setSs("0" + ss);
      }
    }, 100);
  };

  useEffect(() => {
    if (props.initialSeconds) {
      console.log("pawandeep");
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
  }, []);

  useEffect(() => {
    calculateTotalSeconds();
  }, [hh, mm, ss]);
  return (
    <div
      className={`bg-gray-200 py-2 w-full rounded-full  border-none box-content flex  
      `}
    >
      <input
        type="text"
        value={hh}
        className="bg-gray-200 text-right  w-[20px] focus:outline-none ml-2"
        onChange={(e) => {
          hour(e);
        }}
        ref={hhRef}
        onFocus={() => {
          activeFocuse("hh");
        }}
        onKeyDown={(e) => {
          onKeyDownCapture(e, "hh");
        }}
        onBlur={(e) => {
          onBlureHandle("hh");
        }}
      />
      <p className="mx-[3px]">:</p>
      <input
        type="text"
        value={mm}
        className={`bg-gray-200 w-[20px] focus:outline-none ${!enableSeconds && 'mr-2' }`}
        onChange={(e) => {
          minute(e);
        }}
        maxLength={2}
        ref={mmRef}
        onFocus={() => {
          activeFocuse("mm");
        }}
        onKeyDown={(e) => {
          onKeyDownCapture(e, "mm");
        }}
        onBlur={(e) => {
          onBlureHandle("mm");
        }}
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
          onFocus={() => {
            activeFocuse("ss");
          }}
          onKeyDown={(e) => {
            onKeyDownCapture(e, "ss");
          }}
          onBlur={(e) => {
            onBlureHandle("ss");
          }}
        />
      )}
    </div>
  );
};

export default HhmmssSelector;