"""Adds a `kit` to every culture card: the club's playing colours and the
pattern of the shirt, so the UI can draw an original geometric motif per club.

Deliberately not crests or logos — those are trademarks we don't ship. A kit is
described here as data (two colours plus a pattern) and drawn in CSS, so the
artwork is our own.

Patterns: solid | stripes (vertical) | hoops (horizontal) | band (centre band)
"""

import io
import json
import os

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')

KITS = {
    'culture-liverpool':          ('#c8102e', '#00b2a9', 'solid'),
    'culture-manchester-united':  ('#da291c', '#fbe122', 'solid'),
    'culture-arsenal':            ('#ef0107', '#ffffff', 'band'),
    'culture-real-madrid':        ('#ffffff', '#febe10', 'solid'),
    'culture-fc-barcelona':       ('#a50044', '#004d98', 'stripes'),
    'culture-atletico-madrid':    ('#ce3524', '#ffffff', 'stripes'),
    'culture-bayern-munich':      ('#dc052d', '#ffffff', 'solid'),
    'culture-borussia-dortmund':  ('#fde100', '#000000', 'hoops'),
    'culture-juventus':           ('#000000', '#ffffff', 'stripes'),
    'culture-inter-milan':        ('#0068a8', '#000000', 'stripes'),
    'culture-ac-milan':           ('#fb090b', '#000000', 'stripes'),
    'culture-seattle-sounders':   ('#5d9741', '#005595', 'solid'),
    'culture-portland-timbers':   ('#00482b', '#d69a00', 'solid'),
    'culture-manchester-city':    ('#6caddf', '#1c2c5b', 'solid'),
    'culture-chelsea':            ('#034694', '#dba111', 'solid'),
    'culture-tottenham':          ('#ffffff', '#132257', 'solid'),
    'culture-west-ham':           ('#7a263a', '#1bb1e7', 'solid'),
    'culture-newcastle':          ('#241f20', '#ffffff', 'stripes'),
    'culture-sunderland':         ('#eb172b', '#ffffff', 'stripes'),
    'culture-brighton':           ('#0057b8', '#ffffff', 'stripes'),
    'culture-nottingham-forest':  ('#e53233', '#ffffff', 'solid'),
    'culture-crystal-palace':     ('#1b458f', '#c4122e', 'stripes'),
    'culture-leeds':              ('#ffffff', '#1d428a', 'solid'),
    'culture-psg':                ('#004170', '#da291c', 'band'),
    'culture-marseille':          ('#ffffff', '#2faee0', 'solid'),
}


def main():
    path = os.path.join(ROOT, 'league_feature', 'server', 'data', 'culture.json')
    cards = json.loads(io.open(path, encoding='utf-8').read())

    missing = []
    for card in cards:
        kit = KITS.get(card['id'])
        if not kit:
            missing.append(card['id'])
            continue
        rebuilt = {}
        for key, value in card.items():
            rebuilt[key] = value
            if key == 'colors':
                rebuilt['kit'] = {'primary': kit[0], 'secondary': kit[1], 'pattern': kit[2]}
                # A photo for the club header, if the team ever licenses one.
                rebuilt['imageUrl'] = card.get('imageUrl')
        card.clear()
        card.update(rebuilt)

    io.open(path, 'w', encoding='utf-8').write(json.dumps(cards, ensure_ascii=False, indent=2) + '\n')
    print('kits set:', len(cards) - len(missing), '| missing:', missing)


if __name__ == '__main__':
    main()
