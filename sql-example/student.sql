-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------
-- Script :      Entrepôt de données
-- Database:     
-- Date de maj : 08.10.2019
-- Version :     1.0,          
-- Auteur :      Christophe        
-- Modif :       Réalisation de la partie requêtes   

-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Création des tables

-- ----------------------------------------------------------
-- ----------------------------------------------------------
-- Script :      SQLServer_FabriqueFiltresSchema.sql
-- Database:     FabriqueFiltres
-- Date de maj : 10 septembre 2019
-- Version :     2019.01
-- Auteur :      Gabor
-- Modif :       Legeres adaptations liees au cours V2019 

-- ----------------------------------------------------------
-- ----------------------------------------------------------


--REALISATION DES REQUETES

-- 1)  Les chiffres d’affaire réalisés, coût des commandes et marges brutes par client triés de manière décroissante par marge brute
	-- Schéma : (Description AS 'Description client', SUM(MontantFactureCHF) AS 'Montant facturé en CHF', 
	-- SUM(CoutCde) AS 'Cout de la commande', SUM(MargeBrute) AS 'Marge brute').

	Select Description AS 'Description Client',
			SUM(MontantFactureCHF) AS 'Montant Facturé en CHF',
			SUM(CoutCDE) AS 'Cout de la commande',
			SUM(MargeBrute) AS 'Marge brute'
	FROM CLNT
	Inner join FCTR on FCTR.ClientCE = CLNT.CP
	GROUP BY Description, MontantFactureCHF, CoutCde, MargeBrute
	ORDER BY [Marge brute]  DESC;


-- 2)  Les chiffres d’affaire réalisés, coût des commandes et marges brutes regroupés et triés par client et par mois
	-- Schéma : (Description AS 'Description client', Mois, SUM(MontantFactureCHF) AS 'Montant facture en CHF', 
	-- SUM(CoutCde) AS 'Coût commande', SUM(MargeBrute) AS 'Marge brute).

	Select Description AS 'Description client', Mois,
			SUM(MontantFactureCHF) AS 'Montant Facture en CHF',
			SUM(CoutCde) AS 'Coût commande',
			SUM(MargeBrute) AS 'Marge brute'
	FROM CLNT
	Inner join FCTR on FCTR.ClientCE = CLNT.CP
	Inner join CLDR ON CLDR.CP = FCTR.DateFactureCE

	GROUP BY Description, MontantFactureCHF, CoutCde, MargeBrute, Mois,NoClient
	ORDER BY NoClient, Mois ASC;

	-- Question énoncé: Le tri du client s'effecture selon son numéro ? pas précisé
	-- Question le group by doit toujours contenir toutes les colonnes citées ? Si j'enlève le Noclient
	-- Question: le tri s'effectue selon

-- 3) Les moyennes des coûts des commandes et des marges brutes réalisées par nom de représentant
   -- Schéma : (Nom AS 'Nom représentant', CAST(AVG(CoutCde) AS DECIMAL(10,2)) AS 'Moyenne coût commande', 
   -- CAST(AVG(MargeBrute) AS DECIMAL(10,2)) AS 'Moyenne marge brute').

   Select Nom AS 'Nom représentant',
		CAST(AVG(CoutCde) AS DECIMAL(10,2)) AS 'Moyenne coût commande',
		CAST(AVG(MargeBrute) AS DECIMAL(10,2)) AS 'Moyenne marge brute' -- Question: 10,2 --> 10 chiffres avant la virgule et deux après ? quand devons-nous modifirer ça ?
	FROM FCTR
	Inner join RPRS ON RPRS.CP = FCTR.RepresentantCE
	GROUP BY Nom, CoutCde, MargeBrute;

	--Question : Pourquoi avons-nous des moyennes négatives ? Sous-entendu que le représentant a sorti cet argent de l'entreprise ?
	/*select CoutCde
	from FCTR
	Group BY CoutCde
	Having CoutCde <= 0 --8 résultats sortent*/


-- 4) Le nombre d’affaires déficitaires par famille d’articles
   -- Schéma : (Famille, COUNT(*) AS 'Affaires déficitaires'). 
   -- Donc le nombre de famille dont la marge brute est inférieure à 0

   Select Famille, 
		COUNT(*) AS 'Affaires déficitaires'
	FROM ARTC
	Inner join FCTR ON FCTR.ArticleCE = ARTC.CP
	WHERE MargeBrute < 0
	GROUP BY Famille;

-- 5) Le nombre d’affaires bénéficiaires regroupées et triées par trimestre et famille d’articles
   -- Schéma : (Trimestre, Famille, COUNT(*) AS 'Nombre affaires')

   Select Trimestre, Famille, COUNT(*) AS 'Nombre affaires'
   FROM CLDR
   Inner join FCTR ON FCTR.DateComptableCE = CLDR.CP
   Inner join ARTC ON ARTC.CP = FCTR.ArticleCE
   Where MargeBrute > 0
   GROUP BY Trimestre, Famille
   ORDER BY Trimestre, Famille;

-- 6) Le nombre de factures émises par jour du mois
   -- Schéma : (NoJourMois, COUNT(*) AS 'Nb factures émises par jour du mois)

   Select NoJourMois, COUNT(*) AS 'Nb factures émises par jour du mois'
   FROM FCTR
   inner join CLDR on CLDR.CP = FCTR.DateFactureCE
   GROUP BY NoJourMois
   ORDER BY NoJourMois;

-- 7) Le nombre de factures émises par jour de la semaine
   -- Schéma : (Jour, COUNT(*) AS 'Nb factures émises par jour de la semaine')

   Select Jour, Count(*) AS 'Nb de factures émises par jour de la semaine'
   FROM FCTR
   Inner join CLDR on CLDR.CP = FCTR.DateFactureCE
   GROUP BY Jour, NoJourSemaine
   ORDER BY NoJourSemaine;

   -- Autre requête pour comparer les valeurs
   /*Select Jour, Count(*) AS 'Nb de factures émises par jour de la semaine', NoJourMois, Mois
   FROM CLDR
   GROUP BY Jour, NoJourMois, Mois*/

-- 8) Les pays et le nombre de factures par pays pour les pays ayant généré moins de trois factures, affichés par nombre de factures et pays
   -- Schéma : (Pays, COUNT(*) AS 'Nb factures')

   Select Pays, COUNT(*) AS 'Nb factures'
   FROM CLNT
   Inner join FCTR on FCTR.ClientCE = CLNT.CP
	GROUP BY Pays
	HAVING COUNT (*) < 3 ;
   

-- 9) Les dates (jour, no jour mois, mois et année) ayant eu plus de quinze factures émises
   -- Schéma : (Jour, NoJourMois, Mois, Annee, COUNT(*) AS Total)

   Select Jour, NoJourMois, Mois, Annee, COUNT(*) AS Total
   FROM CLDR
   Inner join FCTR on FCTR.DateComptableCE = CLDR.CP
	GROUP BY Jour, NoJourMois, Mois, Annee
	HAVING COUNT(*) > 15;

-- 10) Les cinq clients ayant généré le plus de marge brute
    -- Schéma : (TOP 5 Description, SUM(MargeBrute) AS 'Total marge brute').

	Select TOP 5 Description, SUM(MargeBrute) AS 'Total marge brute'
	FROM CLNT
	Inner join FCTR ON FCTR.ClientCE = CLNT.CP
	GROUP BY Description
	ORDER BY [Total marge brute] DESC;

-- 11) Les dix meilleurs clients - par rapport a leur marge brute contributive - parmi les trois pays ayant la marge brute la plus grande
    -- Schéma : (TOP 10 Pays, Description, SUM(MargeBrute) AS 'Total marge brute')
	
	Select TOP 10 Pays, Description, 
			SUM(MargeBrute) AS 'Total marge brute'
	FROM CLNT
	inner join FCTR ON FCTR.ClientCE = CLNT.CP

	Where Pays IN (		Select Top 3 Pays
						From CLNT
						Inner Join FCTR ON FCTR.ClientCE = CLNT.CP
						GROUP BY Pays
						Order BY Sum(MargeBRute) DESC )

	GROUP BY Description, Pays
	ORDER BY [Total marge brute] DESC;



	