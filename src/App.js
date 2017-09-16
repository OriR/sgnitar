import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import AutoComplete from 'react-autocomplete';
import tmdb from './tmdb-wrapper';
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      personResults: [],
      currentPerson: null,
      creditResults: null
    };

    this.getActors = debounce((query) => {
      if (!query || query.length === 0) {
        this.setState({ personResults: [] });
        return;
      }

      tmdb.search.getPerson({ query, include_adult: false })
      .then((data) => {
        this.setState({ personResults: data.results });
      });
    }, 300);
  }
  render() {
    return (
      <div className="App">
        <AutoComplete
          inputProps={{
            placeholder: "Search actors"
          }}
          value={this.state.query}
          getItemValue={_ => _.name}
          items={this.state.personResults}
          renderItem={(item, isHighlighted) => {
            return (
              <div key={`${item.id}-${item.name}`} style={{margin: '5px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', background: isHighlighted ? 'lightgray' : 'white' }}>
                <div style={{height: '45px', width: '45px', marginRight: '10px', display: 'flex', overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}}>
                  <img style={{height: '70px'}} src={`${tmdb.common.images_uri}/w92/${item.profile_path}`} />
                </div>
                {item.name}
              </div>
            );
          }}
          sortItems={(a,b) => b.popularity - a.popularity}
          onChange={(e) => {
            this.setState({ query: e.target.value });
            this.getActors(e.target.value);
          }}
          onSelect={(name, item) => {
            tmdb.people.getCredits({ id: item.id }).then(credits => {
              this.setState({ currentPerson: item.name, creditResults: credits });
            });
          }}
        />
        {
          this.state.creditResults && (
            <div style={{ marginTop: '20px'}}>
              <span>Average score for {this.state.currentPerson} </span>
              <span>
                {
                  this.state.creditResults.cast.reduce((sum, credit) => sum + parseInt(credit.vote_count) * parseInt(credit.vote_average), 0) / this.state.creditResults.cast.reduce((sum, credit) => sum + credit.vote_count, 0)
                }
              </span>
            </div>
          )
        }
      </div>
    );
  }
}

export default App;
