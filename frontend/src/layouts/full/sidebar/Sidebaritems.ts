import { uniqueId } from "lodash";

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

const SidebarContent: MenuItem[] = [
  {
    heading: "PREGLED",
    children: [
      {
        name: "Nadzorna plošča",
        icon: "solar:home-2-linear", // ikona hiše
        id: uniqueId(),
        url: "/",
      },
    ],
  },
  {
    heading: "PORABA IN OMREŽNINA",
    children: [
      {
        name: "Simulacija porabe",
        icon: "solar:calculator-linear",
        id: uniqueId(),
        url: "/simulate-power",
      },
      {
        name: "Omrežnina",
        icon: "solar:chart-2-linear",
        id: uniqueId(),
        url: "/network-fee",
      },
      {
        name: "Poraba po mesecih",
        icon: "solar:graph-linear",
        id: uniqueId(),
        url: "/monthly-consumption",
      },
      {
        name: "Statistika moči",
        icon: "solar:bolt-circle-linear",
        id: uniqueId(),
        url: "/power-stats",
      },
    ],
  },
  {
    heading: "PODATKI IN RAZLAGE",
    children: [
      {
        name: "Naloži podatke",
        icon: "tabler:file-upload",
        id: uniqueId(),
        url: "/upload-data",
      },
      {
        name: "Razlaga računa",
        icon: "solar:file-text-linear",
        id: uniqueId(),
        url: "/reciept-explanation",
      },
    ],
  },
];

export default SidebarContent;
