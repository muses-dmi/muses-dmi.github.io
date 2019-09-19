# Programmatically expressing rhythms
<!-- 

# [Tidal Cycles](https://tidalcycles.org/index.php/Welcome)

```
d1 $ sound "bd sd"

d2 $ sound "hh hh hh hh"
``` -->


# pat

```
hh = Hi Hat
bd = Bass Drum
sn = Snare

a = A4
b = B4
...
```
Musical events are defined prior to creating a Pattern. 
>The definition of a musical event is implementation specific


A Pattern is a string with spaces separating events. Events are distributed evenly through a measure.


Quarter notes in 4/4:
```python
bd sn bd sn 
```
<img src="assets/images/patNotated1.png" alt="muses project" height=100 style="border-style:none;box-shadow:none;"> 

Quarter notes in 3/4:
```python
bd hh hh
```
<img src="assets/images/patNotated2.png" alt="muses project" height=100 style="border-style:none;box-shadow:none;"> 


Patterns can contain nested patterns to create subdivisions:
```python
bd [sn bd] bd [sn [bd bd]] 
```
<img src="assets/images/patNotated3.png" alt="muses project" height=100 style="border-style:none;box-shadow:none;"> 

```python
bd [sn sn sn] bd [sn sn sn sn sn] 
```
<img src="assets/images/patNotated4.png" alt="muses project" height=100 style="border-style:none;box-shadow:none;"> 


We provide two combinators:

``` |:| ``` for merging patterns polyrhythmically

``` -|- ``` for merging patterns polymetrically


### https://github.com/muses-dmi/pat

<!-- ```python
[a c e] a a [a c e] a a  -|- a c a c  |:| g [g c] g [g c] g [g c] g a
``` -->

```python
[a c e] a a [a c e] a a  
-|- a c a c  
|:| g [g c] g [g c] g [g c] g a
```
<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/663465305&color=%23ff5700&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>