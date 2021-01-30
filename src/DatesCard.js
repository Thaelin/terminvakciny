import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import moment from 'moment';
import Link from '@material-ui/core/Link';
import LinesEllipsis from 'react-lines-ellipsis';
import Tooltip from '@material-ui/core/Tooltip';

export default class DatesCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Link target="_blank" href={"https://maps.google.com/?q="+this.props.place.latitude+","+this.props.place.longitude}>Otvoriť na mape</Link>
                    <h4>
                        <Tooltip title={this.props.place.city + ' - ' + this.props.place.title}>
                            <LinesEllipsis
                                text={this.props.place.city + ' - ' + this.props.place.title}
                                maxLine='1'
                                ellipsis='...'
                                trimRight
                                basedOn='letters'
                            />
                        </Tooltip>  
                    </h4>
                    {
                        this.props.placeDates &&
                        <List>
                            {
                                this.props.placeDates.dates.map((date, i) => {
                                    const dateToDisplay = new Date(date.c_date);
                                    let description = '';
                                    if (parseInt(date.is_closed) === 1 || date.free_capacity < 0) {
                                        description += 'Zatvorené'
                                    } else {
                                        description += date.free_capacity + ' voľných miest';
                                    }
                                    return (
                                        <ListItem key={this.props.placeDates.placeId.toString() + i.toString()} style={parseInt(date.free_capacity) <= 0 ? {color: 'red'} : {color: 'green'}}>
                                            {moment(dateToDisplay).format('DD. MM. YYYY') + ' - ' + description} {parseInt(date.free_capacity) > 0 ? <Link target="_blank" href="https://www.old.korona.gov.sk/covid-19-vaccination-form.php">&nbsp;koronagov formulár</Link> : ''}
                                        </ListItem>
                                    );
                                })
                            }
                        </List>
                    }
                    
                </CardContent>
            </Card>
        );
    }
}