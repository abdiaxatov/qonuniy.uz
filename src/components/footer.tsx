"use client"

import { useLanguage } from "@/components/language-provider"

const translations = {
  uzb: {
    text: (
      <span>
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>{" "}
        veb-saytida eʼlon qilingan materiallardan nusxa koʻchirish, tarqatish va boshqa shakllarda foydalanish faqat
        muassisning yozma roziligi bilan amalga oshiriladi.{" "}
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>{" "}
        veb-sayti ommaviy axborot vositasi (OAV) sifatida O‘zbekiston Respublikasi Prezidenti Administratsiyasi
        huzuridagi Axborot va ommaviy kommunikatsiyalar agentligi tomonidan 2025-yil 26-fevral kuni davlat ro`yxatidan
        o`tkazilgan. Guvohnoma: № 639600. Muassis: Soburov Xasanjon Shavkatjon o`g`li. Joylashgan manzili: 151712,
        Farg`ona viloyati, Furqat tumani, Eshon MFY, So`limgoh ko`chasi, 58-uy. Elektron manzil:{" "}
        <a href="mailto:qonuniy.uz@gmail.com" className="font-bold">
          qonuniy.uz@gmail.com
        </a>
        . Barcha huquqlar himoyalangan. Veb-sayt materiallaridan to‘liq yoki qisman foydalanilganda veb-sayt manzili
        ko‘rsatilishi shart. Veb-saytdagi materiallar uchun veb-sayt egasi, xabarlar ostidagi fikrlar uchun
        foydalanuvchining o‘zi javobgar. Ⓣ - maqola va materiallarda qo‘yilgan mazkur belgi ularning tijorat va reklama
        huquqlari asosida eʼlon qilinganligini bildiradi.
      </span>
    ),
  },
  rus: {
    text: (
      <span>
        Копирование, распространение и использование материалов, опубликованных на веб-сайте{" "}
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>
        , в других формах допускается только с письменного согласия учредителя. Веб-сайт{" "}
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>{" "}
        зарегистрирован в качестве средства массовой информации (СМИ) Агентством информации и массовых коммуникаций при
        Администрации Президента Республики Узбекистан 26 февраля 2025 года. Свидетельство: № 639600. Учредитель:
        Собуров Хасанжон Шавкатжонович. Адрес: 151712, Ферганская область, Фуркатский район, МФЙ Эшон, улица Солимгох,
        дом 58. Электронная почта:{" "}
        <a href="mailto:qonuniy.uz@gmail.com" className="font-bold">
          qonuniy.uz@gmail.com
        </a>
        . Все права защищены. При полном или частичном использовании материалов сайта указание адреса сайта обязательно.
        За материалы на сайте отвечает владелец сайта, за комментарии под сообщениями отвечает сам пользователь. Ⓣ -
        данный знак, установленный в статьях и материалах, указывает на то, что они опубликованы на коммерческой и
        рекламной основе.
      </span>
    ),
  },
  eng: {
    text: (
      <span>
        Copying, distributing, and using materials published on the{" "}
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>{" "}
        website in other forms is allowed only with the written consent of the founder. The{" "}
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>{" "}
        website is registered as a mass media (MM) by the Information and Mass Communications Agency under the
        Administration of the President of the Republic of Uzbekistan on February 26, 2025. Certificate: № 639600.
        Founder: Hasanjon Shavkatjonovich Soburov. Address: 151712, Fergana region, Furqat district, Eshon MFY, Solimgoh
        street, house 58. Email:{" "}
        <a href="mailto:qonuniy.uz@gmail.com" className="font-bold">
          qonuniy.uz@gmail.com
        </a>
        . All rights reserved. When using the materials of the website in whole or in part, the website address must be
        indicated. The website owner is responsible for the materials on the website, and the user is responsible for
        the comments under the messages. Ⓣ - this sign placed in articles and materials indicates that they are
        published on a commercial and advertising basis.
      </span>
    ),
  },
  uzb_cyr: {
    text: (
      <span>
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>{" "}
        веб-сайтида эълон қилинган материаллардан нусха кўчириш, тарқатиш ва бошқа шаклларда фойдаланиш фақат муассиснинг
        ёзма розилиги билан амалга оширилади.{" "}
        <a href="https://qonuniy.uz" className="font-bold" target="_blank" rel="noopener noreferrer">
          “qonuniy.uz”
        </a>{" "}
        веб-сайти оммавий ахборот воситаси (ОАВ) сифатида Ўзбекистон Республикаси Президенти Администрацияси ҳузуридаги
        Ахборот ва оммавий коммуникациялар агентлиги томонидан 2025 йил 26 февраль куни давлат рўйхатидан ўтказилган.
        Гувоҳнома: № 639600. Муассис: Собуров Хасанжон Шавкатжонович. Жойлашган манзили: 151712, Фарғона вилояти, Фурқат
        тумани, Эшон МФЙ, Сўлмғоҳ кўчаси, 58-уй. Электрон манзил:{" "}
        <a href="mailto:qonuniy.uz@gmail.com" className="font-bold">
          qonuniy.uz@gmail.com
        </a>
        . Барча ҳуқуқлар ҳимояланган. Веб-сайт материалларидан тўлиқ ёки қисман фойдаланилганда веб-сайт манзили
        кўрсатилиши шарт. Веб-сайтдаги материаллар учун веб-сайт эгаси, хабарлар остидаги фикрлар учун
        фойдаланувчининг ўзи жавобгар. Ⓣ - мақола ва материалларда қўйилган мазкур белги уларнинг тижорат ва реклама
        ҳуқуқлари асосида эълон қилинганлигини билдиради.
      </span>
    ),
  },
}

export const Footer = () => {
  const { currentLanguage } = useLanguage()

  // Get translations for current language
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb

  return (
    <footer className="bg-[#348b9a] p-4 shadow-lg">
      <div className="container mx-auto text-base pb-16 pt-5">
        <span className="text-white ">{t.text}</span>
      </div>
    </footer>
  )
}