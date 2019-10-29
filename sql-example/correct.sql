-- ----------------------------------------------------------
-- ----------------------------------------------------------
-- Script :      SQLServer_FabriqueFiltresRequetes.sql
-- Database:     FabriqueFiltres
-- Date de maj : 10 septembre 2019
-- Version :     2019.01
-- Auteur :      Gabor
-- Modif :       Enleve les accents dans les requetes 

-- ----------------------------------------------------------
-- Tables


-- ----------------------------------------------
-- Chapitre Entrepot de donnees

-- Requete 1
-- Chiffres d'affaire realises, cout des commandes et marges brutes 
-- par client tries de maniere decroissante par marge brute
SELECT Description AS 'Description client', 
       SUM(MontantFactureCHF) AS 'Montant facture en CHF',
       SUM(CoutCde) AS 'Cout de la commande', 
	   SUM(MargeBrute) AS 'Marge brute'
FROM   FCTR
INNER  JOIN CLNT ON ClientCE = CLNT.CP
GROUP  BY CLNT.Description
ORDER  BY [Marge brute] DESC;

-- ------------------------------------------------------------------------------------
-- Requete 2
-- Chiffres d'affaire realises, cout des commandes et marges brutes 
-- regroupes et tries par client et par (no) mois
SELECT Description AS 'Description client', Mois,
       SUM(MontantFactureCHF) AS 'Montant facture en CHF',
	   SUM(CoutCde) AS 'Cout commande', 
	   SUM(MargeBrute) AS 'Marge brute'
FROM   FCTR
INNER  JOIN CLDR AS DateFacture ON DateFactureCE = DateFacture.CP
INNER  JOIN CLNT ON ClientCE = CLNT.CP
GROUP  BY Description, DateFacture.NoMois, DateFacture.Mois
ORDER  BY Description, DateFacture.NoMois;

-- ------------------------------------------------------------------------------------
-- Requete 3
-- Moyennes des couts des commandes et des marges brutes 
-- realisees par (nom) representant
SELECT Nom AS 'Nom representant', 
       CAST(AVG(CoutCde) AS DECIMAL(10,2)) AS 'Moyenne cout commande', 
       CAST(AVG(MargeBrute) AS DECIMAL(10,2)) AS 'Moyenne marge brute'
FROM   FCTR
INNER  JOIN RPRS ON RepresentantCE = RPRS.CP
GROUP  BY Nom;

-- ------------------------------------------------------------------------------------
-- Requete 4 
-- Nombre d'affaires deficitaires par famille d'articles
SELECT Famille, COUNT(*) AS 'Affaires deficitaires'
FROM   ARTC
INNER  JOIN FCTR ON ArticleCE = ARTC.CP
WHERE  MargeBrute < 0
GROUP  BY Famille;

-- ------------------------------------------------------------------------------------
-- Requete 5 
-- Nombre d'affaires beneficiaires regroupe et trie par trimestre et 
-- famille d'articles
SELECT Trimestre, Famille, COUNT(*) AS 'Nombre affaires'
FROM   FCTR
INNER  JOIN CLDR ON DateFactureCE = CLDR.CP 
INNER  JOIN ARTC ON ArticleCE = ARTC.CP 
WHERE  MargeBrute > 0
GROUP  BY Trimestre, Famille
ORDER  BY Trimestre, Famille;

-- ------------------------------------------------------------------------------------
-- Requete 6 
-- Nombre de factures emises par jour du mois
SELECT NoJourMois, 
       COUNT(*) AS 'Nb factures emises par jour du mois'
FROM   FCTR 
INNER  JOIN CLDR ON DateFactureCE = CLDR.CP
GROUP  BY NoJourMois
ORDER  BY NoJourMois;

-- ------------------------------------------------------------------------------------
-- Requete 7 
-- Nombre de factures emises par jour de la semaine
SELECT Jour, 
       COUNT(*) AS 'Nb factures emises par jour de la semaine'
FROM   FCTR 
INNER  JOIN CLDR ON DateFactureCE = CLDR.CP
GROUP  BY Jour, NoJourSemaine
ORDER  BY NoJourSemaine;

-- ------------------------------------------------------------------------------------
-- Requete 8 
-- Pays et nombre de factures par pays pour les pays ayant genere
-- moins de 3 factures, affiches par nombre de factures et pays
SELECT Pays, COUNT(*) AS 'Nb factures'
FROM   FCTR 
INNER  JOIN CLNT ON ClientCE = CLNT.CP
GROUP  BY   Pays
HAVING COUNT(*) < 3
ORDER  BY [Nb factures], Pays;

-- ------------------------------------------------------------------------------------
-- Requete 9
-- Dates (jour, no jour mois, mois et annee) ayant eu plus de quinze factures emises,
-- triees par annee puis no jour annee.
SELECT Jour, NoJourMois, Mois, Annee, COUNT(*) AS Total
FROM   FCTR 
INNER  JOIN CLDR ON DateFactureCE = CLDR.CP
GROUP  BY Annee, Mois, Jour, NoJourMois, NoJourAnnee
HAVING COUNT(*) > 15
ORDER  BY Annee, NoJourAnnee;

-- ------------------------------------------------------------------------------------
-- Requete 10 
-- Cinq clients ayant genere le plus de marge brute, tries par marge brute

-- Variante equijointure INNER JOIN
SELECT     TOP 5 Description, 
           SUM(MargeBrute) AS 'Total marge brute'
FROM       FCTR
INNER JOIN CLNT ON ClientCE = CLNT.CP
GROUP BY   Description
ORDER BY   'Total marge brute' DESC;

-- ------------------------------------------------------------------------------------
-- Requete 11 - Dix meilleurs clients - par rapport a leur marge brute contributive -
-- parmi les trois pays ayant la marge brute la plus grande
SELECT TOP 10 Pays, 
       Description, 
	   SUM(MargeBrute) AS 'Total marge brute'
FROM   CLNT 
INNER  JOIN FCTR ON ClientCE = CLNT.CP
WHERE  Pays IN (
	   SELECT TOP 3 Pays
       FROM   FCTR 
	   INNER  JOIN CLNT ON ClientCE = CLNT.CP
       GROUP  BY Pays
       ORDER  BY SUM(MargeBrute) DESC)
GROUP  BY Description, Pays
ORDER  BY 'Total marge brute' DESC;