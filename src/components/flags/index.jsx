import React from 'react';

const FlagIcon = ({ width = 24, height = 24, children }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={width} 
    height={height} 
    viewBox="0 0 640 480"
    style={{ flexShrink: 0 }}
  >
    {children}
  </svg>
);

export const UKFlag = ({ width, height }) => (
  <FlagIcon width={width} height={height}>
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
  </FlagIcon>
);

export const RussiaFlag = ({ width, height }) => (
  <FlagIcon width={width} height={height}>
    <path fill="#FFF" d="M0 0h640v480H0z"/>
    <path fill="#0039A6" d="M0 160h640v320H0z"/>
    <path fill="#D52B1E" d="M0 320h640v160H0z"/>
  </FlagIcon>
);

export const UzbekistanFlag = ({ width, height }) => (
  <FlagIcon width={width} height={height}>
    <path fill="#1EB53A" d="M0 320h640v160H0z"/>
    <path fill="#0099B5" d="M0 0h640v160H0z"/>
    <path fill="#CE1126" d="M0 153.6h640v172.8H0z"/>
    <path fill="#FFF" d="M0 163.2h640v153.6H0z"/>
    <circle cx="134.4" cy="76.8" r="57.6" fill="#FFF"/>
    <circle cx="153.6" cy="76.8" r="57.6" fill="#0099B5"/>
    <g fill="#FFF">
      <path d="m233.372 76.8 10.473 32.244h33.895l-27.434 19.938 10.473 32.244-27.434-19.938-27.434 19.938 10.473-32.244-27.434-19.938h33.895z"/>
      <path d="m233.372 76.8 10.473 32.244h33.895l-27.434 19.938 10.473 32.244-27.434-19.938-27.434 19.938 10.473-32.244-27.434-19.938h33.895z" transform="translate(45.44)"/>
      <path d="m233.372 76.8 10.473 32.244h33.895l-27.434 19.938 10.473 32.244-27.434-19.938-27.434 19.938 10.473-32.244-27.434-19.938h33.895z" transform="translate(90.88)"/>
      <path d="m233.372 76.8 10.473 32.244h33.895l-27.434 19.938 10.473 32.244-27.434-19.938-27.434 19.938 10.473-32.244-27.434-19.938h33.895z" transform="translate(136.32)"/>
      <path d="m233.372 76.8 10.473 32.244h33.895l-27.434 19.938 10.473 32.244-27.434-19.938-27.434 19.938 10.473-32.244-27.434-19.938h33.895z" transform="translate(-45.44)"/>
    </g>
  </FlagIcon>
);

export const getFlag = (langCode) => {
  switch(langCode) {
    case 'en':
      return <UKFlag />;
    case 'ru':
      return <RussiaFlag />;
    case 'uz':
      return <UzbekistanFlag />;
    default:
      return null;
  }
};

export default {
  UKFlag,
  RussiaFlag,
  UzbekistanFlag,
  getFlag
}; 