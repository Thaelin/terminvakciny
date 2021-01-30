
import React from 'react';
import axios from 'axios';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Checkbox from '@material-ui/core/Checkbox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default class PlacePicker extends React.Component {
    constructor(props) {
        super(props);
        this.loadPlaces = this.loadPlaces.bind(this);
        this.state = {
            places: [],
        };
    }
    
    componentDidMount() {
        this.loadPlaces();
    }

    loadPlaces() {
        axios.get('https://mojeezdravie.nczisk.sk/api/v1/web/get_driveins_vacc')
            .then(res => {
                let places = res.data.payload;
                places.sort(function(a, b) {
                    var nameA = a.city.toUpperCase();
                    var nameB = b.city.toUpperCase();
                    if (nameA < nameB) {
                      return -1;
                    }
                    if (nameA > nameB) {
                      return 1;
                    }
                    return 0;
                  });
                this.setState({ places: places.map(place => {place.selected = false; return place; }) });
            })
            .catch(err => {
                console.error(err);
                this.loadPlaces();
            });
        ;
    }

    render() {
        return (
            <section id="placepicker">
                <Autocomplete
                    multiple
                    id="tags-standard"
                    disableCloseOnSelect
                    onChange={(event, value) => this.props.changeSelectedPlaces(value)}
                    options={this.state.places}
                    getOptionLabel={(option) => option.city + ' - ' + option.title}
                    renderOption={(option, { selected }) => (
                        <React.Fragment>
                          <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option.city + ' - ' + option.title}
                        </React.Fragment>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Výber vakcinačných miest"
                            placeholder="Sem kliknite pre hľadanie vakcinačného miesta"
                        />
                    )}
                />
            </section>
        );
    }

    handleChange(selectedPlaces) {
        this.setState({ selectedPlaces });
    }
}