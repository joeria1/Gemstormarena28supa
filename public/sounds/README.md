# Sound Files

This directory contains sound effects used throughout the application.

## Required Sound Files

The application needs the following MP3 sound files:

- `balance-change.mp3` - Plays when the user wins money or their balance increases
- `cashout.mp3` - Plays when a user cashes out
- `button-click.mp3` - Plays when a button is clicked
- `mine-click.mp3` - Plays when clicking on a safe tile in Mines game
- `mine-explosion.mp3` - Plays when hitting a mine in Mines game
- `card-shuffle.mp3` - Plays when shuffling cards in Blackjack
- `card-deal.mp3` - Plays when dealing cards
- `card-hit.mp3` - Plays when hitting in Blackjack
- `case-hover.mp3` - Plays when hovering over a case
- `case-select.mp3` - Plays when selecting a case
- `race-start.mp3` - Plays when a race starts
- `lightning.mp3` - Plays with lightning visual effects
- `rocket-fly.mp3` - Plays during Crash game rocket flight
- `rocket-crash.mp3` - Plays when the rocket crashes
- `tower-success.mp3` - Plays on successful tower level completion
- `tower-fail.mp3` - Plays when failing in the Tower game
- `plinko-peg.mp3` - Plays when a ball hits a peg in Plinko
- `plinko-win.mp3` - Plays on Plinko win
- `win.mp3` - Generic win sound
- `lose.mp3` - Generic lose sound

## Testing Sound Files

To test if your sound files are working correctly:

1. Navigate to `/sound-tester` in the application
2. Click "Test All Sounds" to check all sound files
3. The tool will identify which sound files are placeholders
4. Replace those with real MP3 files
5. Use the "Play" button to test individual sounds

## Configuration

You can also configure sound settings by visiting `/sound-config`.

## Replacing Sound Files

When replacing placeholder files with real MP3s:
1. Make sure the filename matches exactly (e.g., `cashout.mp3`)
2. The file must be a valid MP3 format
3. Keep sound files relatively short (1-3 seconds) for the best experience 