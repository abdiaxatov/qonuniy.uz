"use client";
import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Tooltip from "@mui/material/Tooltip";
import Telegram from "@mui/icons-material/Telegram";
import Email from "@mui/icons-material/Email";
import Phone from "@mui/icons-material/Phone";
import DescriptionIcon from "@mui/icons-material/Description";

const theme = createTheme({
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0099b5", // ✅ Tooltip fonini o'zgartirish
          color: "#fff",
          fontSize: "14px",
          borderRadius: "8px",
          padding: "8px 12px",
        },
      },
    },
  },
});

const actions = [
  { icon: <DescriptionIcon />, name: "Resume", url: "https://drive.google.com/file/d/1fr9q57wh8L3GBhwjxCphjvv6bCFYbjQn/view" },
  { icon: <Telegram />, name: "Telegram", url: "https://t.me/Abdiaxatov" },
  { icon: <Email />, name: "Email", url: "mailto:abduaxatov007@gmail.com" },
  { icon: <Phone />, name: "Phone", url: "tel:+998940192117" },
];

export default function CustomSpeedDial() {
  const [isVisible, setIsVisible] = React.useState(false);

  // Bosish orqali visibilityni o'zgartirish
  const handleClick = () => {
    setIsVisible((prev) => !prev);
  };

  // Faylni yuklash
  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Boshqa joyga bosganda `SpeedDial`ni yopish
  const handleOutsideClick = (e: MouseEvent) => {
    const speedDialElement = document.querySelector(".MuiSpeedDial-root");
    if (speedDialElement && !speedDialElement.contains(e.target as Node)) {
      setIsVisible(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="mt-[-232px]">
        <Box sx={{ height: 320, transform: "translateZ(0px)", flexGrow: 1 }}>
          <SpeedDial
            ariaLabel="SpeedDial example"
            sx={{ position: "absolute", bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            onClick={handleClick}
            open={isVisible}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
               tooltipTitle={<Tooltip title={action.name}><span>{action.name}</span></Tooltip>}
                sx={{
                  visibility: isVisible ? "visible" : "hidden",
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 0.3s ease, visibility 0s 0.3s",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.name === "Resume") {
                    handleDownload(action.url);
                  } else {
                    window.open(action.url, "_blank");
                  }
                }}
              />
            ))}
          </SpeedDial>
        </Box>
      </div>
    </ThemeProvider>
  );
}
