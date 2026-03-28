import React, { useEffect } from 'react';
import { Dialog, DialogContent, Button, Typography } from '@mui/material';

const winSound = new Audio('/media/win.mp3');

const CongratulationsPopup = ({ open, winner, onClose, onReset }) => {
  const isRed = winner === 1;
  const winnerText = isRed ? 'Red Wins' : 'Blue Wins';
  const accentColor = isRed ? '#ef4444' : '#3b82f6';
  const accentDark = isRed ? '#b91c1c' : '#1d4ed8';
  const glowColor = isRed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';

  useEffect(() => {
    if (open) {
      winSound.currentTime = 0;
      winSound.play().catch(() => {});
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(15, 15, 25, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 0 60px ${glowColor}`,
        },
      }}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' } },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            mb: 1,
            fontFamily: 'inherit',
          }}
        >
          Game Over
        </Typography>
        <Typography
          sx={{
            fontSize: '1.6rem',
            fontWeight: 600,
            color: accentColor,
            mb: 1,
            fontFamily: 'inherit',
            textShadow: `0 0 20px ${glowColor}`,
          }}
        >
          {winnerText}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', mb: 3, fontFamily: 'inherit' }}>
          Ultimate Champion
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Button
            onClick={onReset}
            sx={{
              backgroundColor: accentColor,
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              px: 3,
              '&:hover': { backgroundColor: accentDark },
            }}
          >
            Play Again
          </Button>
          <Button
            onClick={onClose}
            sx={{
              border: `1px solid rgba(255,255,255,0.15)`,
              color: 'rgba(255,255,255,0.5)',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              px: 3,
              '&:hover': { borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' },
            }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CongratulationsPopup;
