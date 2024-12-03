ce code permet d'avoir un type de vehicule dans le tableau vehicules[] qui peuvent 
suivre leur leader par defaut qui est le premier element du tableau qui suit la souris(mode leader) avec parametrage du cerle du leader,
ou le mode serpent qui peut etre soit en mode qui suit la souris (snake) ou serpent errant (snake+wander) ,soit wander total des vehicule
(wander) , ces vehicules peuvent tirer des missiles sur un enemi qui apparait en cliquant sur la souris et qui suit un vehicule errant 
qui appartient au tableau wandert[], on peut aussi generer des obstacles , jai pris en consideration que les obstacles doit etre evite, 
la separation, et les boundaries 

controle des touche:

v:	Ajoute un nouveau véhicule aléatoire dans le tableau vehicules[].
o:	Génère un obstacle à la position actuelle de la souris.
w:	Ajoute un véhicule errant (wander) dans le tableau wandert[].
g:	Active/désactive le mode leader .
s:	Active/désactive le mode serpent .
d:	Active/désactive le mode debug.
f:	Génère 10 véhicules aléatoires dans le tableau vehicules[].