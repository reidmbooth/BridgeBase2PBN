(() => {

    const iframe = document.getElementsByClassName('iframeClass')[0];

    const panels = Array.from(document.querySelectorAll('.handDiagramPanel')).length===0 ? Array.from(iframe.contentWindow.document.querySelectorAll('.handDiagramPanel')) : Array.from(document.querySelectorAll('.handDiagramPanel'));

    const game = panels[0]?.closest('.dealViewer') || document;

    if (panels.length < 4) {
        alert('Could not find the four hands on this Bridge Base page.');
        return;
    }

    const handPanels = panels.slice(0, 4);

    const directions = ['S', 'W', 'N', 'E'];
    const suitSymbols = {
        '\u2663': 'C',
        '\u2666': 'D',
        '\u2665': 'H',
        '\u2660': 'S'
    };

    const readHand = (panel) => {
        const suits = { S: '', H: '', D: '', C: '' };
        const suitLabels = Array.from(panel.children)
            .filter((element) => element.classList.contains('gwt-HTML'));

        for (const suitLabel of suitLabels) {
            const suit = suitSymbols[suitLabel.textContent.trim()];
            const table = suitLabel.nextElementSibling;
            if (suit && table && table.tagName === 'TABLE') {
                suits[suit] = table.textContent
                    .replace(/\s+/g, '')
                    .replace(/10/g, 'T');
            }
        }

        return `${suits.S}.${suits.H}.${suits.D}.${suits.C}`;
    };

    const hands = {};
    handPanels.forEach((panel, index) => {
        hands[directions[index]] = readHand(panel);
    });

    const boardNumber = Number(
        game.querySelector('.boardNumberPanel .gwt-Label')?.textContent.trim()
    ) || 1;
    const dealerOrder = ['N', 'E', 'S', 'W'];
    const vulnerabilityOrder = ['None', 'NS', 'EW', 'Both'];
    const dealer = dealerOrder[(boardNumber - 1) % 4];
    const vulnerability = vulnerabilityOrder[(boardNumber - 1) % 4];

    const names = {};
    const nameLabels = game.querySelectorAll('.nameLabel');
    const directionLabels = game.querySelectorAll('.directionLabel');
    directionLabels.forEach((label, index) => {
        const direction = label.textContent.trim();
        names[direction] = nameLabels[index]?.textContent.trim() || direction;
    });

    const calls = Array.from(game.querySelectorAll('.auctionCell'))
        .map((cell) => cell.textContent.replace(/\s+/g, '').replace(/\u2663/g, 'C')
            .replace(/\u2666/g, 'D').replace(/\u2665/g, 'H').replace(/\u2660/g, 'S'))
        .filter(Boolean);
    const auction = [];
    for (let index = 0; index < calls.length; index += 4) {
        auction.push(calls.slice(index, index + 4).join(' '));
    }

    const pbn = [
        '% PBN 2.1',
        '[Event "Bridge Base Hand"]',
        '[Site "Bridge Base"]',
        `[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, '')}"]`,
        `[Board "${boardNumber}"]`,
        `[West "${names.W || 'West'}"]`,
        `[North "${names.N || 'North'}"]`,
        `[East "${names.E || 'East'}"]`,
        `[South "${names.S || 'South'}"]`,
        `[Dealer "${dealer}"]`,
        `[Vulnerable "${vulnerability}"]`,
        `[Deal "N:${hands.N} ${hands.E} ${hands.S} ${hands.W}"]`,
        '[Scoring "MP"]',
        ''
    ];

    if (auction.length > 0) {
        pbn.push(`[Auction "${dealer}"]`, ...auction, '');
    }

    const blob = new Blob([`${pbn.join('\n')}\n`], {
        type: 'application/x-chess-pgn'
    });
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bridge-base-${timestamp}.pbn`;
    link.click();
    URL.revokeObjectURL(link.href);
})();