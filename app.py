import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, DateTimeLocalField, SubmitField
from wtforms.validators import DataRequired
from datetime import datetime, timezone

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
app.config['SECRET_KEY'] = 'kunci-rahasia-anda-yang-sangat-aman'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'project.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Jadwal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nama_matkul = db.Column(db.String(100), nullable=False)
    dosen = db.Column(db.String(100))
    hari = db.Column(db.String(20))
    jam_mulai = db.Column(db.String(5))
    jam_selesai = db.Column(db.String(5))
    tugas = db.relationship('Tugas', backref='jadwal', lazy=True)

    def __repr__(self):
        return f'<Jadwal {self.nama_matkul}>'

class Tugas(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nama_tugas = db.Column(db.String(200), nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    jadwal_id = db.Column(db.Integer, db.ForeignKey('jadwal.id'), nullable=False)

    def __repr__(self):
        return f'<Tugas {self.nama_tugas}>'

class JadwalForm(FlaskForm):
    nama_matkul = StringField('Nama Mata Kuliah', validators=[DataRequired()])
    dosen = StringField('Nama Dosen')
    hari = SelectField('Hari', choices=[('Senin', 'Senin'), ('Selasa', 'Selasa'), ('Rabu', 'Rabu'), ('Kamis', 'Kamis'), ('Jumat', 'Jumat'), ('Sabtu', 'Sabtu')], validators=[DataRequired()])
    jam_mulai = StringField('Jam Mulai (HH:MM)', validators=[DataRequired()])
    jam_selesai = StringField('Jam Selesai (HH:MM)', validators=[DataRequired()])
    submit_jadwal = SubmitField('Tambah Jadwal')

class TugasForm(FlaskForm):
    mata_kuliah = SelectField('Mata Kuliah', coerce=int, validators=[DataRequired()])
    nama_tugas = StringField('Nama Tugas/Instruksi', validators=[DataRequired()])
    deadline = DateTimeLocalField('Deadline', format='%Y-%m-%dT%H:%M', validators=[DataRequired()])
    submit_tugas = SubmitField('Tambah Tugas')

@app.route('/', methods=['GET', 'POST'])
def index():
    form_jadwal = JadwalForm()
    form_tugas = TugasForm()

    form_tugas.mata_kuliah.choices = [(j.id, j.nama_matkul) for j in Jadwal.query.order_by('nama_matkul').all()]
    
    if not form_tugas.mata_kuliah.choices:
        form_tugas.mata_kuliah.choices = [(0, '--- Pilih Mata Kuliah ---')]
    else:
        form_tugas.mata_kuliah.choices.insert(0, (0, '--- Pilih Mata Kuliah ---'))

    if form_jadwal.validate_on_submit() and 'submit_jadwal' in request.form:
        jadwal_baru = Jadwal(
            nama_matkul=form_jadwal.nama_matkul.data,
            dosen=form_jadwal.dosen.data,
            hari=form_jadwal.hari.data,
            jam_mulai=form_jadwal.jam_mulai.data,
            jam_selesai=form_jadwal.jam_selesai.data
        )
        db.session.add(jadwal_baru)
        db.session.commit()
        flash('Jadwal berhasil ditambahkan!', 'success')
        return redirect(url_for('index'))

    if form_tugas.validate_on_submit() and 'submit_tugas' in request.form:
        if form_tugas.mata_kuliah.data == 0:
            flash('Silakan pilih mata kuliah yang valid.', 'danger')
            return redirect(url_for('index'))
            
        tugas_baru = Tugas(
            nama_tugas=form_tugas.nama_tugas.data,
            deadline=form_tugas.deadline.data,
            jadwal_id=form_tugas.mata_kuliah.data
        )
        db.session.add(tugas_baru)
        db.session.commit()
        flash('Tugas berhasil ditambahkan!', 'success')
        return redirect(url_for('index'))

    jadwals = Jadwal.query.order_by('hari', 'jam_mulai').all()
    tugas_list = Tugas.query.order_by(Tugas.deadline.asc()).all()

    return render_template(
        'index.html',
        form_jadwal=form_jadwal,
        form_tugas=form_tugas,
        jadwals=jadwals,
        tugas_list=tugas_list,
        sekarang=datetime.now(timezone.utc)
    )

@app.route('/delete/jadwal/<int:id>')
def delete_jadwal(id):
    jadwal_to_delete = Jadwal.query.get_or_404(id)
    Tugas.query.filter_by(jadwal_id=id).delete()
    db.session.delete(jadwal_to_delete)
    db.session.commit()
    flash('Jadwal dan tugas terkait telah dihapus.', 'success')
    return redirect(url_for('index'))

@app.route('/delete/tugas/<int:id>')
def delete_tugas(id):
    tugas_to_delete = Tugas.query.get_or_404(id)
    db.session.delete(tugas_to_delete)
    db.session.commit()
    flash('Tugas telah dihapus.', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)