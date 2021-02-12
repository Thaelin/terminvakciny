import React from 'react';
import axios from 'axios';
import './App.css';
import 'fontsource-roboto';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Alert from '@material-ui/lab/Alert';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import PlaceIcon from '@material-ui/icons/Place';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

class App extends React.Component {
    constructor(props) {
      super(props);
      this.load = this.load.bind(this);
      this.filterChanged = this.filterChanged.bind(this);
      this.state = {
        cities: [],
        filter: ''
      };
    }

    componentDidMount() {
      this.load();
    }

    load() {
      this.setState({dataLoaded: false});
      axios
        .get('https://terminvakciny.sk/api/vacc_places.php')
        .then(cities => {
          cities = cities.data.map(city => {
            city.free = 0; 
            city.data = [];
            return city;
          });
          axios
            .get('https://terminvakciny.sk/api/actual_data.php')
            .then(data => {
              this.setState({lastUpdate: new Date()});
              data.data.forEach(row => {
                const city = cities.find(city => city.city === row.city);
                if (city) {
                  city.data.push(row);
                  city.free += row.free_capacity;
                }
              });
              cities.forEach(city => {
                city.dates = [];
                city.data.forEach(row => {
                  let index = city.dates.findIndex(date => { return date.date === row.c_date; });
                  if (index === -1) {
                    city.dates.push({date: row.c_date, free: row.free_capacity, data: [row]});
                  } else {
                    city.dates[index].data.push(row);
                    city.dates[index].free = city.dates[index].free + row.free_capacity;
                  }
                });
                city.dates = city.dates.sort((a, b) => {
                  return ('' + a.date).localeCompare(b.date);
                });
                city.data= null;
                city.dates.forEach(date => {
                  date.places = [];
                  date.data.forEach(row => {
                    let index = date.places.findIndex(place => place.place === row.title);
                    if (index === -1) {
                      date.places.push({place: row.title, free: row.free_capacity, latitude: row.latitude, longitude: row.longitude, address: row.street_name + ' ' + row.street_number});
                    } else {
                      date.places[index].free += row.free_capacity;
                    }
                  });
                  date.data = null;
                });
              });
              this.setState({cities: cities, dataLoaded: true});
            })
            .catch(error => {
                console.error(error);
            });
        })
        .catch(error => {
            console.error(error);
        });

      
    }

    filterChanged(event) {
      this.setState({filter: event.target.value});
    }

    render() {
      return (
        <div className="App">
          <Container maxWidth="lg">
            <h1>Aplikácia pre hľadanie voľných vakcinačných termínov</h1>
            <Button variant="contained" color="secondary" onClick={this.load}>
              Aktualizovať údaje
            </Button>
            <p>Posledná aktualizácia prebehla o {<i>{moment(this.state.lastUpdate).format('DD.MM.YYYY HH:mm:ss')}</i>}</p>
            
              {
                !this.state.dataLoaded  ?
                <div>Načítavam<br></br><CircularProgress color="secondary" /></div>
                :
                <div style={{textAlign: 'left', marginBottom: '20px'}}>
                  <TextField id="filter" value={this.state.filter} onChange={this.filterChanged} label="Filtrovať mesto" variant="outlined" />
                  {
                  this.state.cities.filter(city => city.city.toLowerCase().includes(this.state.filter.toLowerCase())).map((city, index) => {
                    return (
                      <Accordion key={index}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                        >
                          <Typography>{city.city}</Typography>
                          <Chip label={city.free + (city.free === 0 || city.free > 4 ? ' vakcín' : (city.free === 1 ? ' vakcína' : ' vakcíny'))} variant="outlined" style={city.free > 0 ? (city.free > 3 ? {backgroundColor: 'green'} : {backgroundColor: 'orange'}) : {backgroundColor: 'red'}}/>
                        </AccordionSummary>
                        <AccordionDetails>
                            {
                              city.dates.length === 0 &&
                              <Alert severity="warning">Pre toto mesto sa nenašli žiadne voľné vakcinačné termíny</Alert>
                            }
                            {
                              city.dates.map((date, index) => {
                                return (
                                  <Accordion key={index}>
                                    <AccordionSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      aria-controls="panel1b-content"
                                    >
                                      <CalendarTodayIcon></CalendarTodayIcon><Typography>{date.date.substring(8, 10) + '.' + date.date.substring(5, 7) + '.' + date.date.substring(0, 4)}</Typography>
                                      <Chip label={date.free + (date.free === 0 || date.free > 4 ? ' vakcín' : (date.free === 1 ? ' vakcína' : ' vakcíny'))} variant="outlined" style={date.free > 0 ? (date.free > 3 ? {backgroundColor: 'green'} : {backgroundColor: 'orange'}) : {backgroundColor: 'red'}}/>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      {
                                        date.places.map((place, index) => {
                                          return (
                                            <Accordion key={index}>
                                              <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1c-content"
                                              >
                                                <PlaceIcon></PlaceIcon>
                                                <Typography>{place.place + ', ' + place.address}</Typography>
                                                <Chip label={place.free + (place.free === 0 || place.free > 4 ? ' vakcín' : (place.free === 1 ? ' vakcína' : ' vakcíny'))} variant="outlined" style={place.free > 0 ? (place.free > 3 ? {backgroundColor: 'green'} : {backgroundColor: 'orange'}) : {backgroundColor: 'red'}}/>
                                              </AccordionSummary>
                                              <AccordionDetails>
                                                <Link target="_blank" href={"https://maps.google.com/?q="+place.latitude+","+place.longitude}>Otvoriť na mape</Link>
                                                &nbsp;|&nbsp;
                                                <Link target="_blank" href={"https://www.old.korona.gov.sk/covid-19-vaccination-form.php"}>Otvoriť Coronagov formulár</Link>
                                              </AccordionDetails>
                                            </Accordion>
                                          )
                                        })
                                      }
                                    </AccordionDetails>
                                  </Accordion>
                                )
                              })
                            }
                      </AccordionDetails>
                    </Accordion>
                  )
                })
              }
                </div>
                
              }
          </Container>
            
        </div>
      );
    } 
}

export default App;