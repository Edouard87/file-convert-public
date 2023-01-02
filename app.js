/**
 * Server to convert EXCEL files to H2K. See `README.md` for usage.
 */
const express = require("express"),
      fileUpload = require("express-fileupload"),
      bodyParser = require("body-parser"),
      ejs = require("ejs"),
      XLSX = require("xlsx"),
      fs = require("fs"),
      path = require("path")

require('dotenv').config({
  path: path.join(__dirname, ".env")
})

const app = express();
app.use(fileUpload())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname)); // Warning: This is a security vulnerability.

/**
 * @api {get} / Request home page
 * @apiName GetHomeScreen
 * @apiGroup Root
 * 
 * @apiSuccess {String} body The rendered HTML client in ejs capable of
 *                      calling the API with a nicer UI.
 */
app.get("/", function(req, res) {

  res.render("index.ejs")

})

/**
 * @api {post} /upload Convert parsed JSON to H2K document.
 * @apiName ConvertData
 * @apiGroup Root
 * 
 * @apiDescription This endpoint consumes converted data in the body of the request and converts it
 *                 to an H2K XMLS documnent using EJS. However, it does not return the file. Instead, it writes
 *                 it to the `/tmp` directory using the name of the file as the name of the document and returns the
 *                 name of the file in the body of the response. The Client must then know to call the API
 *                 so that it can make the necessary changes.
 * 
 * @apiBody {Object} data The server expects the data as a form in the same format as the `/uploadfile`
 *          endpoint but in JSON format, as in with `.` instead of `[]`.
 * 
 * @apiSuccess {String} body The name of the converted file. The API must be queried again to retrieve the file.
 * @apiError {String} NOPROCESS The file could not be converted.
 */
app.post("/upload", function(req, res) {

// Certain French and English tranlsations of codes must be performed. This is the bank of codes that are stored.

  var ownershipFr = ["Logement privé", "Logement corporatif", "Logement autochtone", "Projets spéciaux (autochtones)", "Projets spéciaux (non autochtones)", "Propriété fédérale", "Propriété provinciale", "Municipal housing", "Ne désire pas d'indicatif"]
  var ownershipEn = ["Dwelling private", "Dwelling corporate", "Dwelling Aboriginal", "Special Projects (aboriginal)", "Special Projects (non-aboriginal)", "Federal housing", "Provincial housing", "Propriété municipale", "Do not want incentive"]

  var houseTypeFr = ["Détaché","Double/semi-détaché"," Duplex (non IRLM)","Triplex (non IRLM)","Appartement (non IRLM)","Rangée, unité d'extrémité","Maison mobile","Rangée, unité du milieu"]
  var houseTypeEn = ["Single Detached","Double/Semi-detached","Duplex (non-MURB)","Triplex (non-MURB)","Apartment (non-MURB)","Row house, end unit","Mobile Home","Row house, middle unit"]

  var storeysFr = ["Un étage","Un étage et demi","Deux étages","Deux étages et demi","Trois étages","Mi-niveau","Entrée mi-niv/demi s-s"]
  var storeysEn = ["One storey","One and a half","Two storeys","Two and a half","Three storeys","Split level","Split entry/Raised base."]

  var facingDirectionFr = ["Sud","Sud-est","Est","Nord-est","Nord","Nord-ouest","Ouest","Sud-ouest"]
  var facingDirectionEn = ["South","Southeast","East","Northeast","North","Northwest","West","Southwest"]

  var yearBuiltFr = ["Spécifié par l'util.","Avant 1920","1920-29","1930-39","1940-49","1950-59","1960-69","1970-79","1980-89","1990-99","2000-"]
  var yearBuiltEn = ["User specified","Before 1920","1920-29","1930-39","1940-49","1950-59","1960-69","1970-79","1980-89","1990-99","2000-"]

  var regionFr = ["COLOMBIE-BRITANNIQUE","ALBERTA","SASKATCHEWAN","MANITOBA","ONTARIO","QUÉBEC","NOUVEAU-BRUNSWICK","NOUVELLE-ÉCOSSE","ÎLE-DU-PRINCE-ÉDOUARD","TERRE-NEUVE-ET-LABRADOR","YUKON","TERRITOIRES DU NORD-OUEST","NUNAVUT","AUTRE"]
  var regionEn = ["BRITISH COLUMBIA","ALBERTA","SASKATCHEWAN","MANITOBA","ONTARIO","QUEBEC","NEW BRUNSWICK","NOVA SCOTIA","PRINCE EDWARD ISLAND","NEWFOUNDLAND AND LABRADOR","YUKON","NORTHWEST TERRITORIES","NUNAVUT","OTHER"]

  var houseIdFr = ["Maison","Multilogement : une unite"]
  var houseIdEn = ["House","Multi-Unit: one unit"]

  var ceillingTypeFr = ["","Combles/pignon","Combles/arête","Cathédrale","Plat","Ciseaux"]
  var ceillingTypeEn = ["","Attic/gable","Attic/hip","Cathedral","Flat","Scissor"]

  var roofSlopeFr = ["Spécifié par l'utilisateur","Toit plat","2 / 12","3 / 12","4 / 12","5 / 12","6 / 12","7 / 12"]
  var roofSlopeEn = ["User specified","Flat roof","2 / 12","3 / 12","4 / 12","5 / 12","6 / 12","7 / 12"]

  // Location has an absurd amount of codes, so this is a temporary way to assign them

  var locationFr = ""
  var locationEn = ""

  switch (parseInt(req.body.weather.location)) {
    case 1:
      locationFr = "Abbotsford"
      locationEn = "Abbotsford"
      break;
    case 46:
      locationFr = "Montreal"
      locationEn = "Montreal"
      break;
    case 48:
      locationFr = "Québec"
      locationEn = "Quebec"
      break;
    case 51:
      locationFr = "Sherbrooke"
      locationEn = "Sherbrooke"
      break;
    case 90:
      locationFr = "Washington"
      locationEn = "Washington"
      break;
    case 120:
      locationFr = "Mont Joli"
      locationEn = "Mont Joli"
      break;
    case 123:
      locationFr = "Ste-Agathe-Des-Monts"
      locationEn = "Ste-Agathe-Des-Monts"
      break;
    default:
    locationFr = "Error"
    locationEn = "Error"
  }

  var data = {

    info: req.body.info,

    weather: {

      region: {

        code: req.body.weather.region,
        english: regionEn[req.body.weather.region-1],
        french: regionFr[req.body.weather.region-1]

      },

      location: {

        code: req.body.weather.location,
        english: locationEn,
        french: locationFr

      }

    },

    file: {

      identification: req.body.file.identification,
      previousFileId: req.body.file.previousFileId,
      enrollmentId: "NO DATA",
      ownership: {
        code: req.body.file.ownership,
        english: ownershipEn[req.body.file.ownership-1],
        french: ownershipFr[req.body.file.ownership-1],
      },
      taxNumber: req.body.file.taxNumber,
      enteredBy: req.body.file.enteredBy,
      company: req.body.file.company,
      builderName: req.body.file.builderName,
      evaluationDate: req.body.file.evaluationDate

    },

    client: {

      name: {

        first: req.body.client.name.first,
        last: req.body.client.name.last

      },

      telephone: req.body.client.telephone,

      streetAddress: {

        street: req.body.client.streetAddress.street,
        city: req.body.client.streetAddress.city,
        province: req.body.client.streetAddress.province,
        postalCode: req.body.client.streetAddress.postalCode

      },

      mailingAddress: {

        name: req.body.client.mailingAddress.name,
        street: req.body.client.mailingAddress.street,
        city: req.body.client.mailingAddress.city,
        province: req.body.client.mailingAddress.province,
        postalCode: req.body.client.mailingAddress.postalCode

      }

    },

    house: {

      labels: {

        english: houseIdFr[req.body.house.id],
        french: houseIdFr[req.body.house.id]

      },
      specifications: {

        buildingType: houseIdEn[req.body.house.id],

        houseType: {
          code: req.body.house.specifications.houseType,
          english: houseTypeEn[req.body.house.specifications.houseType-1],
          french: houseTypeFr[req.body.house.specifications.houseType-1]
        },
        storeys: {
          code: req.body.house.specifications.storeys,
          english: storeysEn[req.body.house.specifications.storeys-1],
          french: storeysFr[req.body.house.specifications.storeys-1]
        },
        facingDirection: {
          code: req.body.house.specifications.facingDirection,
          english: facingDirectionEn[req.body.house.specifications.facingDirection-1],
          french: facingDirectionFr[req.body.house.specifications.facingDirection-1]
        },
        yearBuilt: {
          code: req.body.house.specifications.yearBuilt.code,
          english: yearBuiltEn[req.body.house.specifications.yearBuilt.code-1],
          french: yearBuiltFr[req.body.house.specifications.yearBuilt.code-1],
          value: req.body.house.specifications.yearBuilt.value
        },
        heatedFloorArea: {

          aboveGrade: req.body.house.specifications.heatedFloorArea.aboveGrade,
          belowGrade: req.body.house.specifications.heatedFloorArea.belowGrade

        }

      },
      naturalAirInfiltration: {

        specifications: {

          house: {
            volume: req.body.house.naturalAirInfiltration.specifications.house.volume
          },
          buildingState: {
            highestCeiling: req.body.house.naturalAirInfiltration.specifications.buildingState.highestCeiling
          }

        }

      },
      ventilation: {

        wholeHouseVentilatorList: {

          hrv: {

            supplyFlowrate: req.body.house.ventilation.wholeHouseVentilatorList.hrv.supplyFlowrate,
            exhaustFlowrate: req.body.house.ventilation.wholeHouseVentilatorList.hrv.exhaustFlowrate

          },

          baseVentilator: {

            exhaustFlowrate: req.body.house.ventilation.wholeHouseVentilatorList.baseVentilator.exhaustFlowrate

          }

        }

      }

    },

    basement: {

      floor: {

        measurements: {

          area: req.body.basement.floor.measurements.area,
          perimeter: req.body.basement.floor.measurements.perimeter

        }

      },

      wall: {

        measurements: {

          height: req.body.basement.wall.measurements.height,
          depth: req.body.basement.wall.measurements.depth,
          hasPonyWall: req.body.basement.wall.measurements.hasPonyWall,
          poneyWallHeight: req.body.basement.wall.measurements.poneyWallHeight

        },
        construction: {

          interiorAddedInsulation: {

            code: req.body.basement.wall.construction.interiorAddedInsulation.code,
            value: req.body.basement.wall.construction.interiorAddedInsulation.value

          },

          exteriorAddedInsulation: {

            code: req.body.basement.wall.construction.exteriorAddedInsulation.code,
            value: req.body.basement.wall.construction.exteriorAddedInsulation.value

          }


        }

      }

    },

    components: {

      wall: {

        measurements: {

          perimeter: req.body.components.wall.measurements.perimeter,
          height: req.body.components.wall.measurements.height

        },

        construction: {

          type: {

            code: req.body.components.wall.construction.type.code,
            rValue: req.body.components.wall.construction.type.rValue

          }

        }

      },

      ceiling: {

        label: req.body.components.ceiling.label,

        construction: {

          type: {

            code: req.body.components.ceiling.construction.type,
            english: ceillingTypeEn[req.body.components.ceiling.construction.type-1],
            french: ceillingTypeFr[req.body.components.ceiling.construction.type-1]

          }

        },
        measurements: {

          length: req.body.components.ceiling.measurements.length,
          area: req.body.components.ceiling.measurements.area,
          heelHeight: req.body.components.ceiling.measurements.heelHeight,
          slope: {

            code: req.body.components.ceiling.measurements.slope.code,
            value: req.body.components.ceiling.measurements.slope.value,
            english: roofSlopeEn[req.body.components.ceiling.measurements.slope.code],
            french: roofSlopeFr[req.body.components.ceiling.measurements.slope.code],

          }

        },

        type: {

          rValue: req.body.components.ceiling.type.rValue,
          nominalInsulation: req.body.components.ceiling.type.rValue,
          code: req.body.components.ceiling.type.code,
          idref: req.body.components.ceiling.type.idref

        }

      }

    }

  }

  function isCorruptedFile(file) {

    // ============================
    // This function detects 
    // problems with the document by 
    // looking at empty fields.
    // ============================

    if ((file.match(/=""/g) || []).length > 122) {

      // ======================
      // The file has too many 
      // empty fields. It is 
      // corrupted
      // ======================

      return true

    }

    // if ((file.match(/></g) || []).length > 0) {

      // ======================
      // The file has empty
      // elements. It is thus
      // corrupted.
      // ======================

    //   return true

    // }

    return false

  }

  ejs.renderFile(__dirname + "/h2k_templates/template-gen-2.ejs", data, function(err, str){
    if (err) {
      
      // ===========================
      // An error with EJS occcured.
      // The file could thus not
      // be processed.
      // ===========================

      res.send("NOPROCESS")
    } else {

      if (isCorruptedFile(str)) {

        // ===========================
        // The file has too many empty
        // fields and is thus
        // corrupted.
        // ===========================

        // res.send("NODATA");

        fs.writeFileSync(__dirname + "/tmp/" + req.body.file.identification + ".h2k", str);
        res.send(req.body.file.identification + ".h2k");

      } else {

        // ===========================
        // The file is okay. It is
        // saved and the name is
        // sent to the client so
        // it may be downloaded.
        // ===========================

        fs.writeFileSync(__dirname + "/tmp/" + req.body.file.identification + ".h2k", str);
        res.send(req.body.file.identification + ".h2k");

      }

      
    }

  });

});

/**
 * @api {post} /uploadfile Upload an XLSX document for parsing
 * @apiGroup File
 * @apiName UploadFile
 * 
 * @apiBody {Buffer} uploadData Mandatory encoded file
 * 
 * @apiDescription This method is used to upload the file to the server for parsing to a json object.
 *                 It expects the file to be encoded in multipart form data. The properties in the XLSX document
 *                 will be parsed depending on the specific version of the passed XLSX file. Note that the file
 *                 is temporarily written to a temporary storage in the filesystem, as the XLSX parsing module cannot
 *                 parse a buffer. I do not like this implementation, and I believe there must be a better and more space
 *                 efficient method of working with these files. The reasoning behind this naming convention is because it makes
 *                 it easier to find form fields on the client UI. Once again, not efficient, but it works.
 * 
 * @apiSuccess {String} file[identification] Identification of the file.
 * @apiSuccess {String} file[ownership] Owner of the file. Null is 1.
 * @apiSuccess {String} file[taxNumber] The customer's tax number.
 * @apiSuccess {String} file[evaluationDate] The date of the evaluation.
 * @apiSuccess {String} file[enteredBy] The name of the evaluator.
 * @apiSuccess {String} file[company] The company having completed the evaluation.
 * @apiSuccess {String} client[name][first] The first name of the client.
 * @apiSuccess {String} client[name][last] The last name of the client.
 * @apiSuccess {String} client[telephone] The client's telephone number.
 * @apiSuccess {String} client[streetAddress][street] The street address of the client.
 * @apiSuccess {String} client[streetAddress][city] The home city of the client.
 * @apiSuccess {String} client[streetAddress][province] The home province of the client.
 * @apiSuccess {String} client[streetAddress][postalCode] The postal code of the client.
 * @apiSuccess {String} client[mailingAddress][name] The name for the client's mailing address.
 * @apiSuccess {String} client[mailingAddress][street] The street of the client's mailing address.
 * @apiSuccess {String} client[mailingAddress][city] The city of the client's mailing address.
 * @apiSuccess {String} client[mailingAddress][province] The province of the client's mailing address.
 * @apiSuccess {String} client[mailingAddress][postalCode] The postal code of the client's mailing address.
 * @apiSuccess {String} client[mailingAddress][check] A check in place for development purposes. Setting this to anything
 *                                                    other than 1 will result in a NOCHECK error.
 * @apiSuccess {String} info[id][1] Internal value.
 * @apiSuccess {String} info[id][2] Internal value.
 * @apiSuccess {String} info[value][1] Internal value.
 * @apiSuccess {String} info[value][2] Internal value.
 * @apiSuccess {String} house[specifications][houseType] The house type code.
 * @apiSuccess {String} house[specifications][storeys] The amount of floors in the house.
 * @apiSuccess {String} house[specifications][facingDirection] The direcion the house is facing.
 * @apiSuccess {String} house[specifications][yearBuilt][code] The year the house was built coded 
 * @apiSuccess {String} house[specifications][yearBuilt][value] A human-readable version of the `yearBuilt`.
 * @apiSuccess {String} weather[region] The region the house was built in (internal H2K value).
 * @apiSuccess {String} weather[location] The location the house was built in (internal H2K value).
 * @apiSuccess {String} components[ceiling][type][rValue] The r value of the ceiling insulation.
 * @apiSuccess {String} components[wall][measurements][perimeter] The permiter of the walls.
 * @apiSuccess {String} components[wall][measurements][height] The height of the walls.
 * @apiSuccess {String} components[wall][construction][type][rValue] The r value of the walls.
 * @apiSuccess {String} basement[floor][measurements][area] The area of the basement floor.
 * @apiSuccess {String} basement[floor][measurements][perimeter] The permimeter of the basement floor.
 * @apiSuccess {String} basement[wall][measurements][height] The height of the basement floor.
 * @apiSuccess {String} basement[wall][measurements][depth] The depth of the basement walls.
 * @apiSuccess {String} basement[wall][construction][interiorAddedInsulation][value] The interior added insulation.
 * @apiSuccess {String} house[specifications][heatedFloorArea][aboveGrade] The area of heated floor above grade.
 * @apiSuccess {String} house[specifications][heatedFloorArea][belowGrade] The area of heated floor below grade.
 * @apiSuccess {String} components[ceiling][measurements][area] The area of the ceiling.
 * @apiSuccess {String} house[naturalAirInfiltration][specifications][house][volume] The volume of the house (for air-filtration measurements).
 * @apiSuccess {String} house[naturalAirInfiltration][specifications][buildingState][highestCeiling] The heighest ceiling in the house.
 * @apiSuccess {String} components[ceiling][construction][type] The type of ceiling (internal H2K codes).
 * @apiSuccess {String} components[ceiling][measurements][length] The length of the ceiling.
 * @apiSuccess {String} house[ventilation][wholeHouseVentilatorList][hrv][supplyFlowrate] The ventillation supply's flow rate.
 * @apiSuccess {String} house[ventilation][wholeHouseVentilatorList][hrv][exhaustFlowrate] The exhaust's flow rate.
 * @apiSuccess {String} house[ventilation][wholeHouseVentilatorList][baseVentilator][exhaustFlowrate] The base ventilator's flow rate.
 * 
 * @apiError NOCHECK The uploaded document is invalid. The client[mailingaddress][check]
 * @apiError NOWRITE File could not be parsed, usually because it is empty.
 */
app.post("/uploadfile", function(req, res) {

  // Create directory if it dosen't exist.

  if (!fs.existsSync(path.join(__dirname,"tmp"))){
    fs.mkdirSync(path.join(__dirname, "tmp"));
  }

  fs.writeFile(__dirname + "/tmp/" + req.files.uploadData.name, req.files.uploadData.data, function() {
    var filePath = __dirname + "/tmp/" + req.files.uploadData.name

    try {

      var workbook = XLSX.readFile(filePath)

      var uploadedData = XLSX.utils.sheet_to_json(workbook.Sheets["Edouard"])

      if (uploadedData[0]["client[mailingAddress][check]"] === 1) {

        res.send(uploadedData)

      } else {

        res.send("NOCHECK");

      }

    } catch(error) {

      // #############################################################################
      // This error is triggered beceause a) XLSX was unable to convert the file
      // (which is usually because it is of an unsupported filetype) or b)
      // because the file that was sent is empty, and thus, the field 
      // client[mailingAddress][check] is empty and the program crashed 
      // because of the if statement. NOTE: XLSX will only combine 
      // rows to form key-value pairs if both of said rows have values.
      // #############################################################################

      res.send("NOWRITE");

    }

  });

});

/**
 * @api {get} /download/:name Download file from server storage.
 * 
 * @apiParam {String} name File name with exension.
 * 
 * @apiName DownloadFile
 * @apiGroup File
 * 
 * @apiDescription This method takes the name of the file to download and retrieves it from the
 *                 server store. Note that at the moment, this is a huge security risk as the input
 *                 is not sanitized. Any file can be retrieved, as the app does not have sessions.
 * 
 * @apiSuccess {Body} The XML file. The client should download this file.
 */
app.get('/download/:name', function(req, res) {

  res.setHeader("Set-Cookie", "fileDownload=true; path=/");
  res.set({"Content-Disposition":`attachment; filename=${req.params.name}`});
  res.send(fs.readFileSync(__dirname + "/tmp/" + req.params.name,"utf8"));

});

app.listen(process.env.PORT, function() {

  console.log("Server has started!");

});
