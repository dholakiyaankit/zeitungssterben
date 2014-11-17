d3.tsv('data/sales.tsv', function (err, data) {

var LOG2 = Math.log(2);
var samplesPerYear = 4;
var startQuarter = 9;
var startTime = +(new Date(2001,0,1));
function quarterToDate (quarter) {
	var date = new Date(startTime);
	date.setMonth((quarter - startQuarter) * (12/samplesPerYear));
	return date;
}

function Point (quarter, value) {
	this.quarter = +quarter;
	this.date = quarterToDate(+quarter);
	this.absolute = +value;
}
function Regression (publication, max) {
	this.first = { absolute: +publication.N0 };
	if (max) this.first.relative = this.first.absolute / max.absolute;
	this.lambda = +publication.lambda;
	this.halfLife = -LOG2/publication.lambda/samplesPerYear;
}

var publications = data.map(function (publication) {
	var copies = [], max, min;
	for (column in publication) {
		if (!publication.hasOwnProperty(column)) continue;
		var value = publication[column];
		if ((''+column).match(/^[0-9]+$/) && value !== '') {
			var point = new Point(column, value);
			copies.push(point);
			if (!max || max.absolute < point.absolute) max = point;
			if (!min || min.absolute > point.absolute) min = point;
		}
	}
	copies.forEach(function (point) {
		point.relative = point.absolute/max.absolute;
	});
	return {
		title: publication.name,
		copies: copies,
		max: max,
		min: min,
		regression: new Regression(publication, max)
	};
});

publications.sort(function (a, b) {
	return b.max.absolute - a.max.absolute;
});

$(function() { publications.forEach(list.add); });

$('form').submit(function (ev) {
	ev.preventDefault();
	var publicationRegex = new RegExp($('#tf-publication').val(), 'i');
	var publication = publications.filter(function (p) { return p.title.match(publicationRegex); })[0];
	chart.draw(publication);
});
});