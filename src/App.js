import PlacePicker from './PlacePicker';
import DatesCard from './DatesCard';
import React from 'react';
import axios from 'axios';
import './App.css';
import 'fontsource-roboto';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import moment from 'moment';

class App extends React.Component {
    updatedPlaces = 0;
    placesToUpdate = 0;

    constructor(props) {
      super(props);
      this.changeSelectedPlaces = this.changeSelectedPlaces.bind(this);
      this.startSearch = this.startSearch.bind(this);
      this.changeNotifSetting = this.changeNotifSetting.bind(this);
      this.search = this.search.bind(this);
      this.state = {
          selectedPlaces: [],
          started: false,
          updateInterval: undefined,
          selectedPlaceDates: [],
          lastUpdate: null,
          updating: false,
          notifications: false,
          lastFreeCapacity: 0
      };
    }

    changeSelectedPlaces(value) {
      this.setState({selectedPlaces: value, started: false});
    }

    startSearch() {
      if (this.state.updateInterval) {
        clearInterval(this.state.updateInterval);
        this.setState({updateInterval: undefined});
      }

      this.search();
      let interval = setInterval(this.search, 10000);

      this.setState({
        started: true,
        updateInterval: interval
      });
    }

    search() {
      let updatedPlaces = 0;
      let placesToUpdate = this.state.selectedPlaces.length;
      let free_capacity = 0;

      this.setState({updating: true});

      this.state.selectedPlaces.forEach(place => {
        axios
        .post('https://mojeezdravie.nczisk.sk/api/v1/web/validate_drivein_times_vacc', {
            drivein_id: place.id
        })
        .then(res => {
            let newSelectedPlaceDates = this.state.selectedPlaceDates;
            let existingPlaceDate = newSelectedPlaceDates.find(item => item.placeId === place.id);

            res.data.payload.forEach(date => {
              if (parseInt(date.free_capacity) > 0) {
                free_capacity += parseInt(date.free_capacity);
              }
            });

            if (existingPlaceDate) {
              existingPlaceDate.dates = res.data.payload;
            } else {
              newSelectedPlaceDates.push({
                placeId: place.id,
                dates: res.data.payload
              });
            }
            updatedPlaces++;
            this.setState({selectedPlaceDates: newSelectedPlaceDates});
        })
        .catch(error => {
            console.error(error);
            placesToUpdate--;
        })
        .finally(() => {
            if (updatedPlaces === placesToUpdate) {
              this.setState({lastUpdate: moment().format('DD. MM. YYYY HH:mm:ss')});
              if (this.state.notifications) {
                if (free_capacity > 0 && free_capacity !== this.state.lastFreeCapacity) {
                  new Notification("terminvakciny.sk", {body: "Našli sa voľné vakcinačné termíny. Počet voľných termínov je " + free_capacity + "."});
                } else if (free_capacity === 0 && this.state.lastFreeCapacity > 0) {
                  new Notification("terminvakciny.sk", {body: "Voľné vakcinačné termíny sa minuli."});
                }
                this.setState({lastFreeCapacity: free_capacity});
              }
              this.setState({updating: false});
            }
        });
      });
    }

    changeNotifSetting(event) {
      if (event.target.checked) {
        if (!("Notification" in window)) {
          alert("This browser does not support desktop notification");
        } else {
          if (Notification.permission === "granted") {
            this.setState({
              notifications: true
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                this.setState({
                  notifications: true
                });
              }
            });
          }
        }
      } else {
        this.setState({
          notifications: false
        });
      }
    }

    render() {
      return (
        <div className="App">
            <h1>Aplikácia pre hľadanie voľných vakcinačných termínov</h1>
            <Container maxWidth="lg">
              <PlacePicker selectedPlaces={this.state.selectedPlaces} changeSelectedPlaces={this.changeSelectedPlaces}></PlacePicker>
            </Container>
            <br></br>
            <FormControlLabel style={{marginRight: '0px'}} control={<Checkbox checked={this.state.notifications} onChange={this.changeNotifSetting} name="soundAlarm" />} label="Zapnúť notifikácie pri nájdení voľného miesta"/><Tooltip title="Treba povoliť notifikácie pre stránku v prehliadači. Pre Windows 10 niekedy treba nastaviť: Systém -> Oznámenia a akcie -> Povoliť oznámenia od iných aplikácií alebo odosielateľov"><HelpIcon></HelpIcon></Tooltip>
            <br></br>
              {
              this.state.started 
                ? 
                <div>
                  <h3>
                    Vyhľadávam termíny (posledná aktualizácia: {this.state.lastUpdate ? this.state.lastUpdate : 'ešte nebol'})
                    {this.state.updating && <CircularProgress style={{display: 'inline-block', width: '20px', height: '20px'}}/>}
                  </h3>
                  <i>Zoznam voľných termínov sa aktualizuje každých 10 sekúnd</i><br></br>
                </div>
                :
                <Button disabled={this.state.selectedPlaces.length === 0} onClick={this.startSearch} style={{marginBottom: '10px'}} variant="contained" color="primary">
                Spustiť hľadanie voľných termínov
                </Button>
              }
              { 
                this.state.started &&
                <Grid container style={{marginTop: '10px'}}>
                  {
                    this.state.selectedPlaces.map((place, i) => {
                      return <Grid item xs={12} sm={6} md={4} lg={3}><DatesCard key={place.id.toString() + i.toString()} placeDates={this.state.selectedPlaceDates.find(item => item.placeId === place.id)} place={place}></DatesCard></Grid>;
                    })
                  }
                </Grid>
              }
        </div>
      );
    } 
}

export default App;