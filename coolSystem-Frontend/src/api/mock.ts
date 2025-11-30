import type { IPaginatedComponents } from "../types/index.ts";
import { DefaultImage } from '../components/ComponentCard';

export const COMPONENTS_MOCK: IPaginatedComponents = {
  total: 9, // обновлено с 3 до 9
  items: [
    {
      id: 1,
      title: "Intel Xeon 8490",
      description: "16-ядерный процессор для серверных систем высшего класса с поддержкой DDR5 памяти",
      image_url: DefaultImage,
      tdp: 350,
      status: true,
    },
    {
      id: 2,
      title: "AMD EPYC 9654",
      description: "96-ядерный процессор с 192 потоками, частотой до 3.7 GHz для высокопроизводительных серверов",
      image_url: DefaultImage,
      tdp: 360,
      status: false,
    },
    {
      id: 3,
      title: "Intel Xeon Gold 6418N",
      description: "24-ядерный сбалансированный процессор для enterprise-решений и виртуализации",
      image_url: DefaultImage,
      tdp: 205,
      status: true,
    },
    {
      id: 4,
      title: "NVIDIA H100 80GB",
      description: "Флагманская GPU для AI тренировки и HPC вычислений с тензорными ядрами",
      image_url: DefaultImage,
      tdp: 350,
      status: true,
    },
    {
      id: 5,
      title: "NVIDIA A100 80GB",
      description: "Мощная GPU для дата-центров и AI инференса с поддержкой Multi-Instance",
      image_url: DefaultImage,
      tdp: 250,
      status: true,
    },
    {
      id: 6,
      title: "NVIDIA L40S 48GB",
      description: "Универсальная GPU для виртуализации, рендеринга и AI рабочих нагрузок",
      image_url: DefaultImage,
      tdp: 300,
      status: false,
    },
    {
      id: 7,
      title: "Supermicro PWS-1K2IP-1R",
      description: "Надежный блок питания 1200W с редундантностью для серверных стоек",
      image_url: DefaultImage,
      tdp: 150,
      status: true,
    },
    {
      id: 8,
      title: "Delta Elect. DPS-2000AB",
      description: "Высокоэффективный блок питания 2000W с титановым КПД для дата-центров",
      image_url: DefaultImage,
      tdp: 180,
      status: true,
    },
    {
      id: 9,
      title: "HP 800W Flex Slot Plug",
      description: "Компактный блок питания 800W для blade-систем и плотных стоек",
      image_url: DefaultImage,
      tdp: 80,
      status: true,
    },
  ],
};



// export const COMPONENTS_MOCK: IPaginatedComponents = {
//   total: 3,
//   items: [
//     {
//       id: 101,
//       title: "Intel Xeon 8490",
//       description: "16-ядерный процессор для серверных систем высшего класса с поддержкой DDR5 памяти",
//       image_url: "http://127.0.0.1:9000/images/intel_zeon.webp",
//       tdp: 350,
//       status: true,
//     },
//     {
//       id: 102,
//       title: "AMD EPYC 9654",
//       description: "96-ядерный процессор с 192 потоками, частотой до 3.7 GHz для высокопроизводительных серверов",
//       image_url: "http://127.0.0.1:9000/images/amd_epic.webp",
//       tdp: 360,
//       status: false,
//     },
//     {
//       id: 103,
//       title: "Intel Xeon Gold 6418N",
//       description: "24-ядерный сбалансированный процессор для enterprise-решений и виртуализации",
//       image_url: "http://127.0.0.1:9000/images/intel_xeon_gold.webp",
//       tdp: 205,
//       status: true,
//     },
//   ]
// }
//     {
//       id: 4,
//       title: "NVIDIA H100 80GB",
//       description: "Флагманская GPU для AI тренировки и HPC вычислений с тензорными ядрами",
//       image: "http://127.0.0.1:9000/images/nvidia_h100.webp",
//       tdp: 350,
//       status: true,
//     },
//     {
//       id: 5,
//       title: "NVIDIA A100 80GB",
//       description: "Мощная GPU для дата-центров и AI инференса с поддержкой Multi-Instance",
//       image: "http://127.0.0.1:9000/images/nvidia_a100.webp",
//       tdp: 250,
//       status: true,
//     },
//     {
//       id: 6,
//       title: "NVIDIA L40S 48GB",
//       description: "Универсальная GPU для виртуализации, рендеринга и AI рабочих нагрузок",
//       image: "http://127.0.0.1:9000/images/nvidia_l40s.webp",
//       tdp: 300,
//       status: false,
//     },
//     {
//       id: 7,
//       title: "Supermicro PWS-1K2IP-1R",
//       description: "Надежный блок питания 1200W с редундантностью для серверных стоек",
//       image: "http://127.0.0.1:9000/images/supermicro.webp",
//       tdp: 150,
//       status: true,
//     },
//     {
//       id: 8,
//       title: "Delta Elect. DPS-2000AB",
//       description: "Высокоэффективный блок питания 2000W с титановым КПД для дата-центров",
//       image: "http://127.0.0.1:9000/images/delta_elect.webp",
//       tdp: 180,
//       status: true,
//     },
//     {
//       id: 9,
//       title: "HP 800W Flex Slot Plug",
//       description: "Компактный блок питания 800W для blade-систем и плотных стоек",
//       image: "http://127.0.0.1:9000/images/HP_800W.webp",
//       tdp: 80,
//       status: true,
//     },
//     {
//       id: 12,
//       title: "Название компонента",
//       description: "Описание компонента",
//       image: "http://localhost:9000/images/Components/test.webp",
//       tdp: 65,
//       status: true,
//     },
//   ],
// };