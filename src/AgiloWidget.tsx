import React, { useState,useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./AgiloWidget.css";
import cssText from "./AgiloWidget.css?inline";

function AgiloWidget() {
    const [open,setOpen] = useState(false);

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = cssText;
        document.head.appendChild(style);
    }, []);

    return (
    <>
       <button className="agilow-button" onClick={() => setOpen(!open)}>
            🐞
        </button>

        {
        open && (
            <div className="agilow-frame">
                <iframe
                    src="https://example.com"
                    title="Agilow Chat"
                    style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    }}
                />
            </div>
        )}
    </>
    );
}

export default AgiloWidget;