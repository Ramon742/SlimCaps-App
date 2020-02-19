const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ProdutoSchema = new Schema({
    nome: String,
    preco: Number,
    image: String,
    descricao: String,
    reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	],
	avgRating: { type: Number, default: 0 }
});

//does not working
ProdutoSchema.pre('remove', async function() {
	await Review.remove({
		_id: {
			$in: this.reviews
		}
	});
});

ProdutoSchema.methods.calculateAvgRating = function() {
	let ratingsTotal = 0;
	if(this.reviews.length) {
		this.reviews.forEach(review => {
			ratingsTotal += review.rating;
		});
		this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
	} else {
		this.avgRating = ratingsTotal;
	}
	const floorRating = Math.floor(this.avgRating);
	this.save();
	return floorRating;
}

module.exports = mongoose.model('Produto', ProdutoSchema);