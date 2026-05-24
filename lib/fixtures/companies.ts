import type { Company } from "@/lib/types";

export const companies: Company[] = [
  {
    id: "ru-istina",
    name: "ООО \"Истина в Вине\"",
    jurisdiction: "RU",
    countryLabel: "Россия",
    currency: "RUB",
    presentationCurrency: "RUB",
    description:
      "Демо-компания для импорта, дистрибуции и розничной реализации вина в России.",
    industry: "Импорт, дистрибуция и розничная реализация вина",
  },
  {
    id: "zm-lusaka",
    name: "Lusaka Vintners Ltd",
    jurisdiction: "ZM",
    countryLabel: "Замбия",
    currency: "ZMW",
    presentationCurrency: "USD",
    description:
      "Educational demo company for beverage import and distribution in Zambia.",
    industry: "Beverage importer and distributor",
  },
];
