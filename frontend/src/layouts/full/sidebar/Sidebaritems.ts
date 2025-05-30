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

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    heading: "DOMOV",
    children: [
      {
        name: "Nadzorna plošča",
        icon: "solar:widget-add-line-duotone",
        id: uniqueId(),
        url: "/",
      },
    ],
  },
  {
    heading: "SIMULACIJA",
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
    ],
  },
  {
    heading: "UPORABNO",
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
  }
];

export default SidebarContent;
