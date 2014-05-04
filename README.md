# Sample Map

## Overview

- Currently live in <http://mozio.waldecir.com.br>

### Usage

#### URL: /maps

- Show a map in insert mode
- after the first insert you must, enter in edit mode again to add another polygon, using the top toolbar
- With you submit with more than one polygon then the register will have multiple bounding boxes
- when submitting you will be redirected to the /maps/search url

#### URL: /maps/search

- When you click the latlng will be queried in the database and return the number of polygons related to this specific point
- When you use search box, the query will be executed for all places returned through google search places, so you would expect multiple alerts.


### Software Requirements

1. Mysql 5.6+
2. Nginx
3. Ubuntu 14.04 x64
4. Supervisor

```
sudo apt-get install mysql-server-5.6 nginx supervisor
```

### Hardware Requirements

1. At least 1GB mysql 5.6+ has problem with small machines <1GB.


### Installation

#### Mysql
	
	1. Create a user mozio with password mozio
	2. Crate a database mozio for the user mozio

#### Nginx

	1. setup server_names_hash_bucket_size to 64
	2. configure the ghost in mozio.nginx

#### Install code and dependencies

	1. fab server setup
	
ps.: The script need some interation, in syncdb and collect static


### Know problems

- Mysql still young on spatial indexes, they are changing GIS internal library to boost the performance, resource: <http://mysqlserverteam.com/making-use-of-boost-geometry-in-mysql-gis/>

- in maps/views.py we have used extra to write the here clausule because **django 1.6+** still using **MBRContains** which can lead to a false positive because the **Minimum Bounding Rectangle** but **mysql 5.6+** has the st_contains(g1, g2) which uses the exact shape.

- GeoDjango tables must be MyISAM, so you need to setup django to create all tables in this database storage or create after syncdb you need to alter table to myisam and install manually the index

- Django field MultyPolygon won't work in **admin**, so the admin is used only for delete operations.

##### Table script


```
CREATE TABLE `maps_shapemodel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `mpoly` multipolygon NOT NULL,
  PRIMARY KEY (`id`),
  SPATIAL KEY `maps_shapemodel_mpoly_id` (`mpoly`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
```

### Sugestions

- Use mongodb/postgres as geospatial database to archive better performance on this type of query, so in this database we will have the id and the polygons.
 
##### Sample query on mongodb

```
db.<collection>.find( { <location field> :
                         { $geoWithin :
                            { $geometry :
                               { type : "Polygon" ,
                                 coordinates : [ [ [ <lng1>, <lat1> ] , [ <lng2>, <lat2> ] ... ] ]
                      } } } } )
```

- Freehand draw <http://jsfiddle.net/uF62D/1/> but it is easy to plug in current code.




