# Omreznina+

Spletna aplikacija uporabnikom omogoča enostavno razumevanje njihovih stroškov električne energije in omrežnine. Rešitev pomaga analizirati in simulirati porabo ter izbrano priključno moč na podlagi realnih podatkov (položnice ipd.). Glavne funkcionalnosti aplikacije so:

1.	Prikaz mesečne porabe elektrike
Ta funkcionalnost omogoča uporabniku, da si ogleda grafični prikaz porabe električne energije po mesecih. Podatki se lahko prikažejo na podlagi ročno vnesenih vrednosti ali uvoženih datotek. Namen je omogočiti enostaven pregled nad spremembami v porabi čez čas.
1.1	User stories
Kot uporabnik želim videti mesečni graf porabe elektrike, da lažje sledim svojim navadam. 
Kot uporabnik želim primerjati mesečne porabe med leti, da ocenim vpliv varčevalnih ukrepov.
2	Vizualizacija stroškov omrežnine in električne energije
Uporabnik bo imel jasno ločen prikaz med stroški omrežnine in stroški porabljene elektrike. To omogoča boljše razumevanje strukture računa in hitrejše odkrivanje, kje so možni prihranki. Prikaz bo interaktiven in grafično pregleden.
2.1	User stories
Kot uporabnik želim vizualno ločene prikaze stroškov omrežnine in porabljene energije, da razumem, kaj vpliva na račun.
Kot uporabnik želim videti, kako se stroški spreminjajo mesečno, da ocenim, ali bi moral optimizirati priključno moč.
3	Simulacija porabe
Uporabnik lahko vnese različne scenarije uporabe električnih naprav, da simulira mesečno porabo. Sistem na podlagi teh vnosov izračuna pričakovane stroške. To uporabniku omogoča načrtovanje bolj učinkovite rabe elektrike.
3.1	User stories
Kot uporabnik želim simulirati prihodnjo porabo, da lahko ocenim prihodnje stroške.
Kot uporabnik želim vnesti različne scenarije porabe (npr. uporaba klime), da vidim njihov vpliv na račun.
4	Napoved mesecev prekoračitev
Sistem na osnovi zgodovinskih podatkov napove, v katerih mesecih obstaja verjetnost prekoračitve dogovorjene priključne moči. Uporabnik prejme opozorilo za prihodnje mesece, kjer lahko pričakuje višje stroške. Funkcionalnost temelji na preprostih napovednih modelih.
4.1	User stories
Kot uporabnik želim opozorilo, kateri meseci bodo verjetno presegli priključno moč, da se pripravim na višje stroške.
Kot uporabnik želim videti verjetnost prekoračitev, da prilagodim svojo porabo.
5	Spremljanje prekoračitev
Uporabnik ima dostop do realnega pregleda, koliko je trenutna ali predvidena poraba blizu dogovorjene moči. Sistem omogoča tudi pregled nad zgodovinskimi prekoračitvami in njihovimi posledicami. Funkcionalnost deluje kot pomoč pri sprotnem nadzoru.
5.1	User stories
Kot uporabnik, želim sprotno spremljati, koliko sem blizu prekoračitve, da pravočasno zmanjšam porabo.
Kot uporabnik, želim pregled nad zgodovino prekoračitev, da razumem, kdaj do njih prihaja.
6	Ročni vnos podatkov ali uvoz iz mojelektro.si
Uporabnik lahko vnese podatke o porabi elektrike in stroških ročno ali jih uvozi iz datoteke, pridobljene s portala mojelektro.si. To zagotavlja fleksibilnost glede vira podatkov. Uporabnik ima nadzor nad kakovostjo in natančnostjo vnesenih informacij.
6.1	User stories
Kot uporabnik želim naložiti datoteko z mojelektro.si, da ne vnašam podatkov ročno.
Kot uporabnik želim možnost ročnega vnosa podatkov, če nimam dostopa do portala.


7	Optični zajem podatkov z računa (OCR)
Uporabnik lahko fotografira ali naloži skeniran račun, sistem pa z OCR tehnologijo samodejno prebere ključne podatke (poraba, stroški, datumi). S tem se odpravi potreba po ročnem vnosu, kar pohitri postopek. Uporabnik ima možnost preveriti in potrditi prebrane podatke.
7.1	User stories
Kot uporabnik želim slikati račun in samodejno prebrati podatke, da prihranim čas.
Kot uporabnik želim preveriti pravilnost prebranih podatkov iz OCR, da se izognem napakam.
8	Izračun optimalne moči glede na lanske podatke
Funkcionalnost analizira uporabnikovo porabo iz preteklega leta in predlaga optimalno priključno moč, ki bi prinesla največji prihranek. Sistem upošteva prekoračitve, rezervo in stroške različnih tarif. Cilj je uporabniku omogočiti bolj informirano odločitev glede zakupa moči.
8.1	User stories
Kot uporabnik želim priporočilo optimalne priključne moči, da zmanjšam stroške.
Kot uporabnik želim analizo lanskih podatkov, da temelji priporočilo na dejanskih vzorcih porabe.


Diagram primerov uporabe:
![Omreznina+ DPU (1)](https://github.com/user-attachments/assets/a45e504c-9bcd-4897-9801-cb341208ddd4)
