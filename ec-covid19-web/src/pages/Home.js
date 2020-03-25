import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'

import { GlobalStyle } from '../styles/core/global'
import { Layout } from '../components/Layout'
import { Map } from '../components/Map'
import { DataSection } from '../components/DataSection'
import { Results } from '../components/Results'
import { Table } from '../components/Table'
import { LineChart } from '../components/LineChart'
import { colors } from '../settings/charts'
import { request } from 'graphql-request'

export class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      totalCases: [],
      selectedPlace: {},
      currentHistory: [],
      countryCases: null
    }
    this.handlerClickGeography = this.handlerClickGeography.bind(this)
  }

  handlerClickGeography(properties) {
    const currentCase = this.state.totalCases.find(d => d.placeCode === properties.placeCode )
    if (currentCase && currentCase.placeCode !== '00') {
      this.setState({selectedPlace: properties})
    }
  }

  componentDidMount() {
    this.getTotalConfirmedCases()
    this.getHistoryCases()
  }

  getTotalConfirmedCases () {
    const query = `
      query {
        getTotalConfirmedCases {
          placeId
          placeCode
          placeName
          placeTypeId
          ConfirmedCases {
            caseDate
            confirmed
            dead
            healed
            updateDate
          }
        }
      }    
    `

    request('/api', query)
    .then(data => {
      const countryCases = data.getTotalConfirmedCases.find(d => d.placeCode === '00' )
      this.setState({totalCases: data.getTotalConfirmedCases, countryCases})
    })
    .catch(error => {
      console.log(error)
    })
  }

  getHistoryCases () {
    const query = `
      query {
        getHistoryCasesOfPlace(placeCode: "00") {
          caseDate
          confirmed
          dead
          healed
        }
      }
    `
    request('/api', query)
    .then(data => {
      const historyCases = data.getHistoryCasesOfPlace
      const confirmed = { id: 'Confirmados', color: colors.infected, data: []}
      const dead = { id: 'Muertos', color: colors.dead, data: []}
      const healed = { id: 'Recuperados', color: colors.healed, data: []}
      
      historyCases.forEach(hisCas => {
        confirmed.data.push({x: hisCas.caseDate, y: hisCas.confirmed})
        dead.data.push({x: hisCas.caseDate, y: hisCas.dead})
        healed.data.push({x: hisCas.caseDate, y: hisCas.healed})
      })
      console.log([confirmed, dead, healed])
      this.setState({currentHistory: [confirmed, dead, healed]})
    })
    .catch(error => {
      console.log(error)
    })    
  }

  render() {
    return (
      <>
        <GlobalStyle />
        <Layout>
          <Map
            data={this.state.totalCases}
            selectedPlace={this.state.selectedPlace}
            onClickGeography={this.handlerClickGeography}
          />
          <DataSection>
            <Results data={this.state.countryCases} placeName='Ecuador'/>
            <Table data={this.state.totalCases} onRowClick={this.handlerClickGeography} selectedPlace={this.state.selectedPlace} />
            <LineChart data={this.state.currentHistory} />
          </DataSection>
        </Layout>
        <ReactTooltip html={true} />
      </>
    )
  }
}
