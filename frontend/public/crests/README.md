# Club crests

Drop your crest files here, named after the culture card id, then run:

```bash
npm run crests
```

That points each card at its file. Cards with no matching file keep showing the kit motif
drawn from the club's colours, so the app never requests an image that isn't there.

SVG is best — it scales and stays crisp in both the 56px badge and anywhere we use it
larger. PNG, WebP, JPG and AVIF also work. Square artwork with a little transparent padding
sits best in the badge.

| Club | Filename |
|---|---|
| Liverpool | `culture-liverpool.svg` |
| Manchester United | `culture-manchester-united.svg` |
| Arsenal | `culture-arsenal.svg` |
| Real Madrid | `culture-real-madrid.svg` |
| FC Barcelona | `culture-fc-barcelona.svg` |
| Atlético Madrid | `culture-atletico-madrid.svg` |
| Bayern Munich | `culture-bayern-munich.svg` |
| Borussia Dortmund | `culture-borussia-dortmund.svg` |
| Juventus | `culture-juventus.svg` |
| Inter Milan | `culture-inter-milan.svg` |
| AC Milan | `culture-ac-milan.svg` |
| Seattle Sounders | `culture-seattle-sounders.svg` |
| Portland Timbers | `culture-portland-timbers.svg` |
| Manchester City | `culture-manchester-city.svg` |
| Chelsea | `culture-chelsea.svg` |
| Tottenham Hotspur | `culture-tottenham.svg` |
| West Ham United | `culture-west-ham.svg` |
| Newcastle United | `culture-newcastle.svg` |
| Sunderland | `culture-sunderland.svg` |
| Brighton & Hove Albion | `culture-brighton.svg` |
| Nottingham Forest | `culture-nottingham-forest.svg` |
| Crystal Palace | `culture-crystal-palace.svg` |
| Leeds United | `culture-leeds.svg` |
| Paris Saint-Germain | `culture-psg.svg` |
| Olympique de Marseille | `culture-marseille.svg` |

The script also reports unmatched files, so a typo in a filename shows up straight away
rather than silently doing nothing.

Nothing ships in this folder by default — these are assets your team supplies and has
cleared for use.
