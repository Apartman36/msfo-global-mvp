# Упрощённые IFRS/MSFO правила

Все правила являются учебными. Они демонстрируют механику трансформации, но не являются полноценной IFRS-методологией.

## IFRS 16 - аренда

**Входы:** годовая аренда, срок аренды, ставка дисконтирования.

**Формула:** `PV = rent * (1 - (1 + r)^(-n)) / r`.

**Выходы:**

- Dr Right-of-use assets / Cr Lease liabilities на PV.
- Dr Depreciation expense / Cr Right-of-use assets на `PV / n`.
- Dr Finance costs / Cr Lease liabilities на `PV * r`.

## IFRS 9 - ожидаемые кредитные убытки

**Входы:** дебиторская задолженность и возрастные корзины.

**Ставки демо:** 0-30 дней 0,5%, 31-60 дней 2%, 61-90 дней 5%, 90+ дней 20%.

**Формула:** `ECL = sum(bucketAmount * lossRate)`.

**Выход:** Dr Expected credit loss expense / Cr Receivables.

## IAS 16 - основные средства

**Входы:** валовая стоимость ОС, накопленная амортизация, срок полезного использования.

**Формула:** `Annual depreciation = PPE gross / usefulLife`.

**Выход:** Dr Depreciation expense / Cr PPE.

## IAS 21 - валютная переоценка

**Входы:** валютная сумма, старый курс, курс закрытия.

**Формула:** `FX difference = foreignAmount * (closingRate - oldRate)`.

**Выход:** для валютного обязательства рост курса создаёт Dr FX loss / Cr monetary item.

## IAS 36 - обесценение

**Входы:** балансовая стоимость и возмещаемая сумма.

**Формула:** `Impairment = max(0, carryingAmount - recoverableAmount)`.

**Выход:** Dr Impairment loss / Cr Asset.

## IAS 12 - отложенный налог

**Входы:** временная разница и ставка налога.

**Формула:** `Deferred tax = temporaryDifference * taxRate`.

**Выход:** Dr Deferred tax expense / Cr Deferred tax liability.

## IFRS 15 - выручка

**Входы:** выручка.

**Формула:** `Deferred revenue = revenue * 10%`.

**Выход:** Dr Revenue / Cr Contract liability. В MVP contract liability показан в составе торговой и прочей кредиторской задолженности.
