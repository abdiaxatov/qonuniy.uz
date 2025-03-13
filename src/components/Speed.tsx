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
import { useLanguage } from "@/components/language-provider";

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

const translations = {
  uzb: {
    portfolio: "Portfolio",
    telegram: "Telegram",
    email: "Email",
    twitter: "Twitter",
    phone: "Telefon",
    profileName: "Soburov Xasanjon Shavkatjon o'g'li",
    profileDescription: `Veb-sayt egasi Soburov Xasanjon Shavkatjon o'g'li- huquq magistri, 3-darajali yurist. Sud va adliya organlarida faoliyat olib borgan. Barcha huquqiy masalalarda yuridik yordam xizmati mavjud. Telefon: `,
    close: "Yopish",
  },
  rus: {
    portfolio: "Портфолио",
    telegram: "Телеграм",
    email: "Электронная почта",
    twitter: "Твиттер",
    phone: "Телефон",
    profileName: "Soburov Xasanjon Shavkatjon o'g'li",
    profileDescription: `Владелец сайта Soburov Xasanjon Shavkatjon o'g'li - магистр права, юрист третьего уровня. Работал в судах и органах юстиции. Оказывает юридическую помощь по всем правовым вопросам. Телефон: `,
    close: "Закрыть",
  },
  eng: {
    portfolio: "Portfolio",
    telegram: "Telegram",
    email: "Email",
    twitter: "Twitter",
    phone: "Phone",
    profileName: "Soburov Xasanjon Shavkatjon o'g'li",
    profileDescription: `The owner of the website, Soburov Xasanjon Shavkatjon o'g'li, holds a master's degree in law and is a third-level lawyer. He has worked in courts and justice bodies. Legal assistance is available for all legal matters. Phone: `,
    close: "Close",
  },
  uzb_cyr: {
    portfolio: "Портфолио",
    telegram: "Телеграм",
    email: "Электрон почта",
    twitter: "Твиттер",
    phone: "Телефон",
    profileName: "Soburov Xasanjon Shavkatjon o'g'li",
    profileDescription: `Веб-сайт эгаси Soburov Xasanjon Shavkatjon o'g'li - ҳуқуқ магистри, 3-даражали юрист. Суд ва адлия органларида фаолият олиб борган. Барча ҳуқуқий масалаларда юридик ёрдам хизмати мавжуд. Телефон: `,
    close: "Ёпиш",
  },
};

const actions = (t: any) => [
  { icon: <Person />, name: t.portfolio },
  { icon: <Telegram />, name: t.telegram, url: "https://t.me/qonuniyuz_bot" },
  { icon: <Email />, name: t.email, url: "mailto:qonuniy.uz@gmail.com" },
  { icon: <Twitter />, name: t.twitter, url: "https://twitter.com/qonuniy.uz" },
  { icon: <Phone />, name: t.phone, url: "tel:+998337923192" },
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
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb;

  const [isVisible, setIsVisible] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const handleClick = () => {
    setIsVisible((prev) => !prev);
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
            {actions(t).map((action) => (
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
                  if (action.name === t.portfolio) {
                    handleOpen();
                  } else if (action.url) {
                    window.open(action.url, "_blank");
                  }
                }}
              />
            ))}
          </SpeedDial>
        </Box>
        <Modal open={isModalOpen} onClose={handleClose}>
          <Box sx={style} className="rounded-xl border">
            <Avatar alt="Profil rasmi" src="/Avatat.jpg" sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h6" component="h2">
              {t.profileName}
            </Typography>
            <Typography sx={{ mt: 2 }}>
              {t.profileDescription}
              <a href="tel:+998337923192" className="underline">
                +998 (33) 792-31-92
              </a>
              ,{" "}
              <a href="tel:+998917453192" className="underline">
                +998 (91) 745-31-92
              </a>
              .
            </Typography>
            <Button onClick={handleClose} sx={{ mt: 2 }} variant="contained" color="primary">
              {t.close}
            </Button>
          </Box>
        </Modal>
      </div>
    </ThemeProvider>
  );
}