import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import AutoComplete from 'react-autocomplete';
import tmdb from './tmdb-wrapper';
import './App.css';
import EmojiRating from './EmojiRating';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      personResults: [],
      currentPerson: null,
      creditResults: null,
      toggles: {}
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

  getRating(credits, type, extraFilters = () => true) {
    credits = credits.filter(credit => new Date(credit.release_date) < new Date() && credit.vote_count > 0 && extraFilters(credit));
    const precisionRound = (number, precision) => {
      const factor = Math.pow(10, precision);
      const tempNumber = number * factor;
      const roundedTempNumber = Math.round(tempNumber);
      return roundedTempNumber / factor;
    };

    const normalizedValue = credits.reduce((sum, credit) => sum + parseFloat(credit.vote_count) * parseFloat(credit.vote_average), 0);
    const normalizedSum = credits.reduce((sum, credit) => sum + credit.vote_count, 0);

    if (normalizedSum === 0) {
      return null;
    }

    return (
      <div key={type} style={{ marginTop: '20px'}}>
        <div onClick={() => this.setState({ toggles: { ...this.state.toggles, [type]: !this.state.toggles[type] } })}>
          <span>Average rating for {this.state.currentPerson} as a {type} </span>
          <span> { precisionRound(normalizedValue / normalizedSum, 1) } </span>
          <span>(with {credits.length} title(s))</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          { this.state.toggles[type] &&
            credits.map(credit => {
              return (
                <div key={credit.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', marginBottom: '15px' }}>
                    { credit.poster_path && <img title={ credit.original_title || credit.original_name } src={`${tmdb.common.images_uri}/w92/${credit.poster_path}`} style={{ width: '92px', height: '138px'}} /> }
                    <EmojiRating max={10} rating={credit.vote_average}/>
                </div>
              );
            })
          }
        </div>
      </div>
    );
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
                  { item.profile_path && <img style={{height: '70px'}} src={`${tmdb.common.images_uri}/w92/${item.profile_path}`} /> }
                  { !item.profile_path && <div style={{backgroundColor: 'teal', width: '100%', height: '100%'}}></div>}
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
              this.setState({ currentPerson: item.name, creditResults: credits, toggles: {} });
            });
          }}
        />
        { this.state.creditResults && this.getRating(this.state.creditResults.cast, 'Actor', credit => credit.character && credit.character.toLowerCase() !== 'himself' && credit.character.toLowerCase() !== 'herself') }
        { this.state.creditResults && Object.values(this.state.creditResults.crew.reduce((jobs, credit) => {
          jobs[credit.job] = jobs[credit.job] || [];
          jobs[credit.job].push(credit);
          return jobs;
        }, {})).map(jobCredits => {
          return this.getRating(jobCredits, jobCredits[0].job);
        }) }
      </div>
    );
  }
}

export default App;
