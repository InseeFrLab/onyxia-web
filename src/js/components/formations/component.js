import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Grid } from '@material-ui/core';
import FilDAriane, { fil } from 'js/components/commons/fil-d-ariane';
import FormationCard from 'js/components/commons/formation-card';
import { axiosURL, wrapPromise } from 'js/utils';
import conf from 'js/configuration';

const resource = wrapPromise(axiosURL(conf.CONTENT.FORMATIONS_URL));

const Content = (props) => {
	const res = resource.read();
	const id = props.match.params['id'];
	const formations = id
		? (res.find((r) => r.courseCode === id) &&
				res.find((r) => r.courseCode === id).hasPart) ||
		  []
		: res;
	const parent = res.find((r) => r.courseCode === id);
	const filAccessor = id
		? fil.formation(parent.courseCode, parent.name)
		: fil.formations;
	return (
		<>
			<div className="en-tete">
				<Typography
					variant="h2"
					align="center"
					color="textPrimary"
					gutterBottom
				>
					La liste des formations disponibles.
				</Typography>
			</div>
			<FilDAriane fil={filAccessor} />
			<div className="contenu accueil">
				<Grid container spacing={8} classes={{ container: 'cartes' }}>
					{formations.map((f) => (
						<FormationCard key={f.courseCode} formation={f} />
					))}
				</Grid>
			</div>
		</>
	);
};

export default withRouter(Content);
