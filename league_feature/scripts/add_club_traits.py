"""Rates every club 1-5 on the seven things that make people pick one.

These are the club-level equivalent of the league traits, and they feed the
"find your club" quiz the same way: the answers build a profile, and each club
is scored against it.

  glory       winning now, trophies, title races
  history     heritage, old giants, things that happened decades ago
  underdog    small budget, punching up, no birthright to anything
  drama       chaos, comebacks, never a quiet season
  identity    local roots, one-club loyalty, fans who own the place
  style       how the football looks — flair over function
  atmosphere  noise, terraces, the matchday itself
"""

import io
import json
import os

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')

#                              glory history underdog drama identity style atmosphere
TRAITS = {
    'culture-liverpool':          (5, 5, 1, 4, 5, 4, 5),
    'culture-manchester-united':  (4, 5, 1, 4, 4, 3, 4),
    'culture-arsenal':            (4, 4, 2, 4, 4, 5, 4),
    'culture-manchester-city':    (5, 3, 1, 3, 3, 5, 3),
    'culture-chelsea':            (4, 3, 2, 4, 3, 3, 3),
    'culture-tottenham':          (2, 4, 3, 5, 4, 4, 4),
    'culture-west-ham':           (2, 3, 4, 4, 5, 3, 4),
    'culture-newcastle':          (2, 4, 3, 4, 5, 3, 5),
    'culture-sunderland':         (1, 3, 5, 4, 5, 2, 5),
    'culture-brighton':           (1, 2, 5, 2, 3, 4, 3),
    'culture-nottingham-forest':  (2, 5, 4, 3, 4, 3, 4),
    'culture-crystal-palace':     (1, 2, 4, 3, 4, 3, 5),
    'culture-leeds':              (2, 4, 3, 5, 5, 3, 5),
    'culture-real-madrid':        (5, 5, 1, 5, 3, 4, 4),
    'culture-fc-barcelona':       (4, 5, 1, 4, 5, 5, 4),
    'culture-atletico-madrid':    (3, 4, 4, 4, 5, 2, 5),
    'culture-bayern-munich':      (5, 5, 1, 3, 4, 4, 4),
    'culture-borussia-dortmund':  (3, 4, 3, 5, 5, 4, 5),
    'culture-juventus':           (5, 5, 1, 3, 3, 3, 3),
    'culture-inter-milan':        (4, 4, 2, 5, 4, 4, 5),
    'culture-ac-milan':           (4, 5, 2, 4, 4, 4, 5),
    'culture-psg':                (5, 2, 1, 4, 3, 5, 4),
    'culture-marseille':          (3, 4, 3, 5, 5, 3, 5),
    'culture-seattle-sounders':   (3, 2, 3, 3, 4, 3, 5),
    'culture-portland-timbers':   (2, 2, 4, 3, 5, 3, 5),
}

KEYS = ('glory', 'history', 'underdog', 'drama', 'identity', 'style', 'atmosphere')


def main():
    path = os.path.join(ROOT, 'league_feature', 'server', 'data', 'culture.json')
    cards = json.loads(io.open(path, encoding='utf-8').read())

    missing = []
    for card in cards:
        values = TRAITS.get(card['id'])
        if not values:
            missing.append(card['id'])
            continue
        rebuilt = {}
        for key, value in card.items():
            rebuilt[key] = value
            if key == 'kit':
                rebuilt['traits'] = dict(zip(KEYS, values))
        card.clear()
        card.update(rebuilt)

    io.open(path, 'w', encoding='utf-8').write(json.dumps(cards, ensure_ascii=False, indent=2) + '\n')
    print(f'rated {len(cards) - len(missing)} clubs' + (f' | missing: {missing}' if missing else ''))


if __name__ == '__main__':
    main()
