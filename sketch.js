let imgs = []
let files = ['biohazardous','corrosion','environment','exclamation_mark','exploding_bomb','flame','flame_circle','gas_cylinder','health_hazard','skull_crossbones']
//let files = []
let info1 = []
let info2 = []
let info3 = []
let tiles = []
let cards = []
let csvData
let font
let fontSize
let button1, button2, button3

class Tile {
  constructor(x,y,img) {
    this.x = x
    this.y = y
    this.offsetX = 0
    this.offsetY = 0
    this.w = img.width
    this.h = img.height
    this.img = img
    this.active = false
    this.overlap = false
    this.remove = false
  }
  move(x,y,arr) {
    if (this.active) {
    this.x = x - this.offsetX
    this.y = y - this.offsetY
   
    }
    else {
      const speed = this.collision_check(arr)
      this.x += speed.x
      this.y += speed.y
      }

    this.x = constrain(this.x, this.w/2, width-this.w/2)
    this.y = constrain(this.y, this.h/2+25, height-this.h/2)


    }
    assign_partner(obj) {
      this.partner = obj
    }
    collision_check(arr) {
      this.overlap = false
      let xSpeed = 0;
      let ySpeed = 0;
      arr.forEach(item => {
        if (item != this) {
          const d = dist(this.x, this.y,item.x, item.y);
          
          const minDist = this.w/2 + item.w/2; // the minimum distance before a collision is detected
          const overlap = minDist - d
          

          if (overlap > 0) {  // if objects are overlapping
            this.overlap = true
            const angle = atan2(this.y - item.y, this.x - item.x);  // angle from item to this
            xSpeed += constrain(overlap * cos(angle),-1,1);  // separate along x axis
            ySpeed += constrain(overlap * sin(angle),-1,1);  // separate along y axis
          }
          else {
            this.overlap = false;
          }
        }
      });
      return {'x': xSpeed, 'y': ySpeed};
    }
     clicked(x, y) {
    const d = dist(x, y, this.x, this.y);
    // Checking against this.w / 2 which is effectively the "radius" of the image.
    // You could adjust this if your images don't fill the entire square (e.g., they have transparent space around them).
    if (d < this.w / 2) {
      this.active = true;
      this.offsetX = x - this.x
      this.offsetY = y - this.y
    
}
  }

  released() {
    if (this.active) {
      let Xn = max(this.partner.x, min(this.partner.x + this.partner.w, this.x))
      let Yn = max(this.partner.y, min(this.partner.y+this.partner.h, this.y))
      let Dx = Xn - this.x
      let Dy = Yn - this.y //maybe need to add?
      if (Dx ** 2 + Dy ** 2 <= (this.w/2) ** 2) {
        this.remove = true
        this.partner.remove = true
      }
    }
    this.active = false
    this.offsetX = 0
    this.offsetY = 0
  }

  show() {
    image(this.img,this.x-this.w/2,this.y-this.h/2)
    noFill()
    //circle(this.x, this.y, this.w)
  }
}

class Prompt {
  constructor(x,y,txt) {
    this.remove = false
    const max_words = 6

    let split_txt = txt.split(" ")
    this.new_split = []
    for (let i = 0; i<split_txt.length; i+=max_words) {
      let group = split_txt.slice(i,i + max_words)
      this.new_split.push(group.join(' '))

    }

    let bbox = this.getBounds(this.new_split)
    //this.img = createGraphics(bbox.w, bbox.h)
    this.img = createGraphics(bbox.w*1.25, bbox.h*1.25)
    this.img.clear()
    this.img.textFont(font)
    this.img.textSize(fontSize)
    for (let i = 0; i<this.new_split.length;i++) {
      this.img.text(this.new_split[i],0,0+bbox.h_arr[i])
    }


    //let bbox = font.textBounds(txt,0,0,fontSize)
    this.colour = 'black'
    this.x = x - bbox.w
    this.y = max(y - bbox.h,bbox.h)

    this.w = bbox.w
    this.h = bbox.h
    this.active = false
    
  }

  getBounds(lines) {
    let maxWidth = 0
    let totalHeight = 0
    let heights = []

    for (let line of lines) {
      let lineBounds = font.textBounds(line,0,0+totalHeight, fontSize)
      maxWidth = max(maxWidth, lineBounds.w)
      totalHeight += lineBounds.h
      heights.push(totalHeight)
    }

    return {w:maxWidth, h: totalHeight, h_arr:heights} 
    }

  

  show() {
    this.x = constrain(this.x, 0, width-this.w)
    this.y = constrain(this.y, 25, height-this.h)
    image(this.img, this.x,this.y)

    noFill()
    //rect(this.x,this.y, this.w, this.h)
    //circle(this.x, this.y-this.h,10)
  }
  assign_partner(obj) {
    this.partner = obj
  }
  collision_check(arr) {
    let xSpeed = 0;
    let ySpeed = 0;
    let overlapping = false
    arr.forEach(item => {
      const l1 = {x:this.x, y:this.y}
      const r1 = {x:this.x + this.w, y:this.y+this.h}
      //circle(l1.x, l1.y,5)
      //circle(r1.x,r1.y,5)
      if (item != this) {
        const l2 = {x:item.x, y:item.y}
        const r2 = {x:item.x + item.w, y:item.y+item.h}

        //const vert_check = r1.y < l2.y || l1.y > r2.y
        //const hori_check = l1.x > r2.x || r1.x < l2.x
        //const hori_check = false
        const hori_check = l1.x < r2.x
        const vert_check = true
      //if (!(hori_check || vert_check)) {

      //overlapping on right
      if (l1.x < r2.x && l2.x < r1.x && l2.y < r1.y && l1.y < r2.y) {
        if (r1.x + l1.x > r2.x + l2.x) {
          xSpeed += 1
        }
        else {
          xSpeed -= 1
        }
        if (r1.y + l1.y > r2.y + l2.y) {
          ySpeed +=1
        }
        else {
          ySpeed -= 1
        }
      }

      }
      
            
    })
    return {'x': xSpeed, 'y': ySpeed};

  }

  move(x,y,arr) {
    if (this.active) {
    this.x = x - this.offsetX
    this.y = y - this.offsetY
    }
    else {
      const speed = this.collision_check(arr)
      this.x += speed.x
      this.y += speed.y
    }
    }

clicked(x,y) {
  const r = this.x
  const l = this.x + this.w
  const t = this.y 
  const b = this.y + this.h
    if (x > r && x < l && y > t && y < b) {    
    this.active = true
    this.offsetX = x - this.x
    this.offsetY = y - this.y
  }
  
}
released () {

  if (this.active) {
    let Xn = max(this.x, min(this.x + this.w, this.partner.x))
    let Yn = max(this.y, min(this.y+this.h, this.partner.y))
    let Dx = Xn - this.partner.x
    let Dy = Yn - this.partner.y 
    if (Dx ** 2 + Dy ** 2 <= (this.partner.w/2) ** 2) {
      this.remove = true
      this.partner.remove = true
    }
  }


  this.active = false
  this.offsetX = 0
  this.offsetY = 0 
}
}

function preload() {
  csvData = loadTable('data/answers.csv', 'csv','header');
  

  files.forEach(file => imgs.push(loadImage(`imgs/${file}.png`)))
  
  font = loadFont('times.ttf')

}

function reset(level) {
  tiles = []
  cards = []
  imgs.forEach(img => {
    
    tiles.push(new Tile(random(0.4*width),random(height),img))
  })

  if (level == 1) {
    console.log('level 1')
  info1.forEach(info => {
    cards.push(new Prompt(random(0.8 * width, width), random(height), info))
  })

}
else if (level == 2) {
  console.log('level 2')
  info2.forEach(info => {
    cards.push(new Prompt(random(0.8 * width, width), random(height), info))
  })

}

else {
console.log('level 3')
  info3.forEach(info => {
    cards.push(new Prompt(random(0.8 * width, width), random(height), info))
  })
}

console.log(cards.length)

  for (let i = 0; i<cards.length;i++) {
    cards[i].assign_partner(tiles[i])
    tiles[i].assign_partner(cards[i])
  
  }

}

function setup() {  
  for (let row of csvData.rows) {
    //files.push(row.get('files'));
    info1.push(row.get('info1'));
    info2.push(row.get('info2'));
    info3.push(row.get('info3'));
}
  createCanvas(windowWidth, windowHeight);
  const ideal_size = min(width,height) / 8

  imgs.forEach(img => {
    const scl = ideal_size / max(img.width,img.height)
    img.resize(scl*img.width,scl*img.height)
    
  })
  fontSize = ideal_size / 5
  textFont(font)
  textSize(fontSize)

  button1 = createButton('Level 1')
  button1.position(0,0)
  button1.mousePressed(() => {reset(1)})
  button2 = createButton('Level 2')
  button2.position(100,0)
  button2.mousePressed(() => {reset(2)})
  button3 = createButton('Level 3')
  button3.position(200,0)
  button3.mousePressed(() => {reset(3)})



  reset(1)

  




  

  

}

function draw() {
  background(200);
  tiles.forEach(tile => {
    tile.show()
    tile.move(mouseX,mouseY,tiles)
  })
  cards.forEach(card => {
    card.show()
    card.move(mouseX,mouseY, cards)
  })

  for (let i = cards.length-1; i>=0;i--) {
    if (cards[i].remove) {
      cards.splice(i,1)
      tiles.splice(i,1)
    }
  }

  
}

function mousePressed() {
  tiles.forEach(tile => tile.clicked(mouseX,mouseY))
  cards.forEach(card => card.clicked(mouseX, mouseY))
}

function mouseReleased() {
  tiles.forEach(tile => tile.released())
  cards.forEach(card => card.released())


}
