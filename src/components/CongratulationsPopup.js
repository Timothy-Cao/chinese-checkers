import React, { useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material'; 
import { red, blue } from '@mui/material/colors'; 

const CongratulationsPopup = ({ open, winner, onClose, onReset }) => {
  const winnerText = winner === 1 ? 'Player 1 (Red)' : 'Player 2 (Blue)';
  const backgroundColor = winner === 1 ? red[500] : blue[500];
  const textColor = winner === 1 ? red[700] : blue[700];

  useEffect(() => {
    if (open) {
      const audio = new Audio('/media/win.mp3');
      audio.play();
    }
  }, [open]); 

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
        Congratulations!
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <Typography variant="h5" color={textColor} sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
          {winnerText}
        </Typography>
        <Typography variant="body1" sx={{ color: 'gray', marginBottom: '2rem' }}>
          YOU ARE THE ULTIMATE CHAMPION
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Button 
            onClick={onReset} 
            variant="contained" 
            sx={{ backgroundColor, color: 'white', '&:hover': { backgroundColor: winner === 1 ? red[700] : blue[700] } }}
          >
            Reset Game
          </Button>
          <Button 
            onClick={onClose} 
            variant="outlined" 
            sx={{ borderColor: textColor, color: textColor, '&:hover': { borderColor: winner === 1 ? red[700] : blue[700], color: winner === 1 ? red[700] : blue[700] } }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CongratulationsPopup;
