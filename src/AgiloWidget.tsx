import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function AgiloWidget() {
    const [open,setOpen] = useState(false);

    return (
    <>
        <button
        onClick={() => setOpen(!open)}
        style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 18px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 9999,
            fontSize: "15px",
        }}
        >
            🐞 Report a Bug
        </button>

        {
        open && (
            <div
            style={{
                position: "fixed",
                bottom: "80px",
                right: "20px",
                width: "400px",
                height: "550px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                zIndex: 9999,
                overflow: "hidden",
            }}
            >
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