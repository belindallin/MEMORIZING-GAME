const GAME_STATE = {
  FirstCardAwards :　"FirstCardAwards" , 
  SecondCardAwards : "SecondCardAwards" ,
  CardsMatchFailed : "CardsMatchFailed" ,
  CardsMatched : "CardsMatchFail" ,
  GameFinished : "GameFinished"
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]


const view = {
  getCardElement ( index ) {
    return `
    <div data-index="${index}" class="card back">
    </div>
    `
  } ,
  getCardContent ( index ) {
    const number = this.transformNumber (( index % 13 ) + 1 )
    const symbol = Symbols [ Math.floor ( index / 13 ) ]
    return `
    <p>${number}</p>
    <img src=${symbol} alt="">
    <p>${number}</p>
    `
  } ,
  transformNumber ( number ) {
    switch ( number ) {
      case 1 :
        return 'A'
      case 11 :
        return 'J'
      case 12 :
        return 'Q'
      case 13 :
        return 'K'
      default :
        return number
    }
  } ,
  displayCards ( indexes ) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map ( index => this.getCardElement ( index ) ).join('')     
  } ,
  filpCards ( ...cards ) {
    cards.map ( card => {
      if ( card.classList.contains('back') ) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(card.dataset.index)
        return
      }
      card.classList.add('back')
      card.innerHTML = null      
    })
  } ,
  pairCards ( ...cards ) {
    cards.map ( card => {
      card.classList.add ( 'paired' )
    })    
  } ,
  renderScore (score) {
    document.querySelector('.score').innerHTML = `Score:${score}`
  } ,
  renderTriedTimes (times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  } ,
  appendWrongAnimation (...cards) {
    cards.map ( card => {
      card.classList.add ('wrong')
      card.addEventListener('animationed' , event => 
        event.target.classList.remove('wrong')
        , { once : true })
    })
  }
}

const controller = {
  currentState : GAME_STATE.FirstCardAwards ,
  generateCards () {
    view.displayCards ( utility.getRandomNumberArray(52) )
  } ,
  dispatchCardAction ( card ) {
    if ( !card.classList.contains( 'back' ) ) return

    switch ( this.currentState ) {
      case GAME_STATE.FirstCardAwards :
        view.filpCards ( card )
        model.revealedCards.push ( card )
        this.currentState = GAME_STATE.SecondCardAwards
        break
      case GAME_STATE.SecondCardAwards :
        view.renderTriedTimes( ++model.triedTimes )
        view.filpCards ( card )
        model.revealedCards.push ( card )
        if ( model.isRevealCardsMatched () ) {
          view.renderScore( model.score += 10 )
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards ( ...model.revealedCards )
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwards
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout ( this.resetCards , 1000 )
        }
      break
    }
  } ,
  resetCards () {
    view.filpCards ( ...model.revealedCards )
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwards

  }
}

const model = {
  revealedCards : [] ,
  isRevealCardsMatched () {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  } ,
  score : 0 ,
  triedTimes : 0 
}

const utility = {
  getRandomNumberArray ( count ) {
    const number = Array.from ( Array( count ).keys() )
    for ( let index = number.length - 1 ; index > 0 ; index-- ) {
      let randomIndex = Math.floor ( Math.random() * ( index + 1 ) ) 
      ; [ number [ index ] , number [randomIndex] ] = [ number [ randomIndex ] , number [ index] ]
    }
    return number
  }
}

controller.generateCards()
document.querySelectorAll('.card').forEach ( card => {
  card.addEventListener ( 'click' , event => {
    controller.dispatchCardAction ( card )
  })    
})