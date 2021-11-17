import React, { useState } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CardActions, CardContent, Tab, Typography } from "@mui/material";
import { Button } from "@mui/material";
import TableDropdown from "./TableDropdown";
import Card from "@mui/material/Card";
import "./BookList.css";
import { Rating } from "@mui/material";




const BookList = ({list, onDelete}) => {
  return (
  <div className = "body">
    
    {list.map((card) => 
    <div className="cardMenu">
      <Card className = "card" key = {card.id}>
         <CardContent>
           <Typography sx={{fontsize: 14}} color="text.secondary" gutterBottom>
             {card.id}
           </Typography>
           <Typography variant = "h5" sx={{textAlign: 'center' }} component="div">
             {card.title}
           </Typography>
           <Typography color="text.secondary" sx={{textAlign: 'center' }}>
             {card.authors}
           </Typography>
           <Typography variant = "body2" sx={{textAlign: 'center' }} >
             Published: {card.publishDate}
           </Typography>
         </CardContent>
        <CardActions>
           <Typography className = "star-button" variant = "body2">
           <Typography component="legend"></Typography>
           <Rating name="simple-controlled"
           value={card.rating}
             />
             <span style={{flexGrow: 1}}/>
           </Typography>
           <Typography>
             <Button size="small"> <TableDropdown text="..."
                  items={
                      [
                        {text: "Pregledaj...", link: true, path: `/book/${card.id}/view`},
                        {text: "Izmeni...", link: true, path: `/book/${card.id}/edit`},
                        {text: "Obrisi", link: false, action: () => onDelete(card.id)}
                      ]
                  }
                  /></Button>
           </Typography>  
           </CardActions>    
         
      </Card>
    </div>
      )} 
      </div>
    );
    
}

/*const Sidebar = () => {
  const ctg = ["All Books", "Science Fiction", "Fantasy", "Computing", "Mystery", "Horror"]
  const [genres, setGenres] = useState(ctg);
  return(<div class="body">
            <div class="sidebar">
                <h3> Genres </h3>
              <a href = "g1"><p> All Books </p></a>
              <a href = "g2"><p> Science Fiction</p></a>
              <a href = "g3"><p> Fantasy</p></a>
              <a href = "g4"><p> Computing</p></a>
              <a href = "g5"><p> Mystery</p></a>
              <a href = "g6"><p> Horror</p></a>
            </div>
        </div>)
  
}*/

/*const BookList = ({list, onDelete}) => {
  return <div>
  <TableContainer component={Paper}>
    <Table sx={{ minWidth: 650 }}>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Naziv</TableCell>
          <TableCell>Autori</TableCell>
          <TableCell>Kategorija</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {list.map((row) => (
          <TableRow
            key={row.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {row.id}
            </TableCell>
            <TableCell>{row.title}</TableCell>
            <TableCell>{row.authors}</TableCell>
            <TableCell>{row.genre}</TableCell>
            <TableCell>
                <TableDropdown text="..."
                items={
                    [
                      {text: "Pregledaj...", link: true, path: `/book/${row.id}/view`},
                      {text: "Izmeni...", link: true, path: `/book/${row.id}/edit`},
                      {text: "Obrisi", link: false, action: () => onDelete(row.id)}
                    ]
                }
                />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  </div>

              }*/
export default BookList; 
