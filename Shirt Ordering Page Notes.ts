

Shirt Ordering
  Validation Page
    User must scan or upload qrcode badge to continue shopping

  Ordering Page
    Multiple Order
    Body / payload
      - Name
      - Zone
      - Size
      - Number
      - Special Number (will be approved by admin)
      - Contact Number(populate registered users mobile number) editable
    * Shirt Preview
    * Shirt Color depends on zone number
    * Size info selection
    * Enter Name (will visible in the shirt)
    * Default Last name of registered user (if available and Applied in first item order)
    * Each Order Item has its own preview
    * Enter Contact Number for shipping purposes
    
    Sizes
      const kidShirtSizes = [
        { size: "6",  width: 10, length: 17 },
        { size: "8",  width: 11, length: 18 },
        { size: "10", width: 12, length: 19 },
        { size: "12", width: 13, length: 20 },
        { size: "14", width: 14, length: 21 },
        { size: "16", width: 15, length: 22 },
        { size: "18", width: 16, length: 23 },
        { size: "20 / 2XS", width: 17, length: 24 }
      ];
      
      const adultShirtSizes = [
        { size: "2XS", width: 17, length: 24 },
        { size: "XS",  width: 18, length: 25 },
        { size: "S",   width: 19, length: 26 },
        { size: "M",   width: 20, length: 27 },
        { size: "L",   width: 21, length: 28 },
        { size: "XL",  width: 22, length: 29 },
        { size: "2XL", width: 23, length: 30 },
        { size: "3XL", width: 24, length: 31 },
        { size: "4XL", width: 25, length: 31.5 },
        { size: "5XL", width: 26, length: 32 },
        { size: "6XL", width: 27, length: 32.5 },
        { size: "7XL", width: 28, length: 33 }
      ];

    Zone Colors
      Zone	  Area	            Color
      Zone 1	Malabon, Navotas	Grey
      Zone 2	Caloocan	        Red
      Zone 3	Valenzuela	      Yellow
      Zone 4	Marikina	        White
      Zone 5	Rizal	            Blue
      Zone 6	Pasig	            Green
      Zone 7	San Juan	        Maroon
      Zone 8	Mandaluyong	      Lavender

      images are in src/assets/images/shirts
      sample : src/assets/images/shirts/zone1.png or just import zone1
      actual image dimension is 800 X 481
      and i want to use draw function from useCanvas hook to generate shirt preview with name
      useCanvas({name, zone, number})