# Mirrored from lawfic.pro

Every `.ts` file in this folder is copied verbatim from `LAWFIC/site/lib/`
(only `.ts` import suffixes are dropped). They are the website's own catalogue,
fees, order statuses, plans, intake questions, invoice rules and account
layout, so the app offers exactly what the website offers under the same names
and the same rules.

Do not edit them here. Change the website's file and copy it across again:

    cp ../LAWFIC/site/lib/{catalogue,services,documents,company,orders,messages,money,pricing,subscription,intake,invoice,statement,wallet-entries,account-sections,profile}.ts src/lawfic/
