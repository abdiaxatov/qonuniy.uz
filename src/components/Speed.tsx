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
import Person from "@mui/icons-material/Person";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Twitter from "@mui/icons-material/Twitter";
const theme = createTheme({
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0099b5",
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
  { icon: <Person />, name: "Portfolio" },
  { icon: <Telegram />, name: "Telegram", url: "https://t.me/qonuniyuz_bot" },
  { icon: <Email />, name: "Email", url: "mailto:abduaxatov007@gmail.com" },
  {icon:<Twitter/>, name:"Twitter", url:"https://twitter.com/nurbek_abdiaxatov"},
  { icon: <Phone />, name: "Telefon", url: "tel:+998940192117" },
];

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default function CustomSpeedDial() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const handleClick = () => {
    setIsVisible((prev) => !prev);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                  if (action.name === "Portfolio") {
                    handleOpen();
                  } else if (action.url) {
                    window.open(action.url, "_blank");
                  }
                }}
              />
            ))}
          </SpeedDial>
        </Box>
        <Modal open={isModalOpen} onClose={handleClose} >
          <Box sx={style} className="rounded-xl border">
            <Avatar alt="Profil rasmi" src="/profile.jpg" sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h6" component="h2">
              Abdiaxatov
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Frontend va backend texnologiyalarda tajribaga ega Full Stack dasturchi.
            </Typography>
            <Button onClick={handleClose} sx={{ mt: 2 }} variant="contained" color="primary">
              Close
            </Button>
          </Box>
        </Modal>
      </div>
    </ThemeProvider>
  );
}